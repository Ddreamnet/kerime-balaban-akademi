/**
 * package-inactive-detector
 *
 * Triggered daily by pg_cron (public.trigger_package_inactive at 09:00 UTC
 * = 12:00 TRT). Bir paket completed olalı 14+ gün geçmiş ama o öğrencinin
 * yeni active paketi henüz oluşmamışsa (yani koç yoklama almamış) admin'e
 * 'package_inactive' bildirimi atılır.
 *
 * İmplicit consent ile paket #N+1 ilk yoklama işaretlemesinde otomatik
 * oluşur — bu cron koçun unutmuş olabileceğini admin'e hatırlatır.
 *
 * Idempotency: aynı child için son 7 gün içinde 'package_inactive' bildirimi
 * atılmışsa atlanır.
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface InactiveRow {
  id: string
  child_id: string
  package_number: number
  actual_end_date: string
  children: { full_name: string } | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    const today = istanbulToday()
    const fourteenDaysAgo = addDays(today, -14).toISOString().slice(0, 10)

    // Adım 1: 14+ gün önce biten en güncel completed paketleri çek
    const { data: candidates, error } = await admin
      .from('packages')
      .select(`
        id,
        child_id,
        package_number,
        actual_end_date,
        children!inner ( full_name )
      `)
      .eq('status', 'completed')
      .lte('actual_end_date', fourteenDaysAgo)
      .returns<InactiveRow[]>()

    if (error) throw error
    if (!candidates || candidates.length === 0) {
      return json({ created: 0, reason: 'no completed packages older than 14d' })
    }

    // Adım 2: Aynı child için active paket var mı? Varsa skip.
    const childIds = [...new Set(candidates.map((c) => c.child_id))]
    const { data: activePackages } = await admin
      .from('packages')
      .select('child_id')
      .eq('status', 'active')
      .in('child_id', childIds)

    const activeChildIds = new Set(
      (activePackages ?? []).map((p) => p.child_id),
    )

    // Adım 3: Aynı child için son 7 gün içinde 'package_inactive' bildirim atılmış mı?
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentNotifs } = await admin
      .from('notifications')
      .select('body')
      .eq('type', 'package_inactive')
      .gt('created_at', cutoff)

    // Body'de child name geçiyor — basit dedup için body match
    const recentBodies = new Set(
      (recentNotifs ?? []).map((n) => n.body).filter(Boolean) as string[],
    )

    // Adım 4: Her child için son completed paket'i alıp bildirim at
    const seen = new Set<string>()
    let created = 0

    for (const pkg of candidates) {
      if (seen.has(pkg.child_id)) continue
      seen.add(pkg.child_id)
      if (activeChildIds.has(pkg.child_id)) continue

      const childName = pkg.children?.full_name ?? '?'
      const daysSince = daysBetween(today, new Date(pkg.actual_end_date))
      const body = `${childName} paketi biteli ${daysSince} gün, koç henüz yeni paket için yoklama almadı.`

      // Body bazlı dedup (aynı child + benzer mesaj)
      const isDuplicate = Array.from(recentBodies).some((b) =>
        b.includes(childName),
      )
      if (isDuplicate) continue

      const { data: inserted } = await admin
        .from('notifications')
        .insert({
          title: 'Hareketsiz öğrenci',
          body,
          type: 'package_inactive',
          target_role: 'admin',
          link_url: `/admin/ogrenci/${pkg.child_id}`,
        })
        .select('id')
        .single()

      if (inserted) {
        created++
        recentBodies.add(body)
        void invokeSend(inserted.id)
      }
    }

    return json({ created, candidates: candidates.length, active_skipped: activeChildIds.size })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[package-inactive-detector] fatal', message)
    return json({ error: message }, 500)
  }
})

async function invokeSend(notificationId: string): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    await fetch(`${url}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ notification_id: notificationId }),
    })
  } catch (err) {
    console.error('[package-inactive-detector] send invoke failed', err)
  }
}

function istanbulToday(): Date {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000
  return new Date(utc + 3 * 3600_000)
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

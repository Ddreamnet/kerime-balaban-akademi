/**
 * attendance-missing-detector
 *
 * Triggered daily by pg_cron (public.trigger_attendance_missing at 18:00 UTC
 * = 21:00 TRT). Bugün için scheduled olan lesson'larda hâlâ status='scheduled'
 * olanlar = yoklama alınmamış demek. Bu durumda admin'e toplu bir
 * 'attendance_missing' bildirimi atılır (kaç sınıf eksik, hangi sınıflar).
 *
 * Sadece paket sistem (lessons tablosu paket-only). Taekwondo monthly
 * öğrencileri etkilenmez.
 *
 * Idempotency: notifications tablosunda son 12 saatte 'attendance_missing'
 * kaydı varsa atlanır.
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface MissingRow {
  id: string
  class_id: string
  classes: { name: string } | null
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

    const todayIso = istanbulToday().toISOString().slice(0, 10)

    const { data: missing, error } = await admin
      .from('lessons')
      .select(`
        id,
        class_id,
        classes!inner ( name )
      `)
      .eq('scheduled_date', todayIso)
      .eq('status', 'scheduled')
      .returns<MissingRow[]>()

    if (error) throw error

    if (!missing || missing.length === 0) {
      return json({ created: 0, reason: 'no missing attendance today' })
    }

    // Idempotency
    const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    const { count: alreadySent } = await admin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'attendance_missing')
      .eq('target_role', 'admin')
      .gt('created_at', cutoff)

    if (alreadySent && alreadySent > 0) {
      return json({ created: 0, reason: 'already sent in last 12h' })
    }

    // Sınıf bazında özet
    const classMap = new Map<string, { name: string; cnt: number }>()
    for (const m of missing) {
      const name = m.classes?.name ?? 'bilinmeyen sınıf'
      const cur = classMap.get(m.class_id) ?? { name, cnt: 0 }
      cur.cnt += 1
      classMap.set(m.class_id, cur)
    }

    const summary = Array.from(classMap.values())
      .map((c) => `${c.name} (${c.cnt} öğrenci)`)
      .join(', ')

    const { data: inserted } = await admin
      .from('notifications')
      .insert({
        title: 'İşaretlenmemiş yoklama',
        body: `Bugün ${classMap.size} sınıfta toplam ${missing.length} öğrencinin yoklaması alınmadı: ${summary}.`,
        type: 'attendance_missing',
        target_role: 'admin',
        link_url: '/admin/devamsizlik',
      })
      .select('id')
      .single()

    if (inserted) {
      void invokeSend(inserted.id)
    }

    return json({
      created: inserted ? 1 : 0,
      missing_lessons: missing.length,
      missing_classes: classMap.size,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[attendance-missing-detector] fatal', message)
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
    console.error('[attendance-missing-detector] send invoke failed', err)
  }
}

function istanbulToday(): Date {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000
  return new Date(utc + 3 * 3600_000)
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

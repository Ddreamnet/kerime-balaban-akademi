/**
 * lesson-reminder
 *
 * Triggered daily by pg_cron (public.trigger_lesson_reminder at 15:00 UTC
 * = 18:00 TRT). Finds lessons whose scheduled_date is exactly tomorrow
 * (TRT) and that are still 'scheduled' (not yet attended), then sends a
 * `lesson_tomorrow` notification per parent.
 *
 * Only paket sistem (lessons table = paket-only). Taekwondo monthly
 * öğrencilerin lesson kaydı yoktur, dolayısıyla bu cron onları etkilemez.
 *
 * Idempotency: notifications tablosunda son 6 saat içinde aynı parent için
 * 'lesson_tomorrow' kaydı varsa atlanır. Cron günde 1 kez çalışır, manuel
 * re-run'lar duplicate üretmez.
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface LessonRow {
  id: string
  child_id: string
  scheduled_date: string
  scheduled_time: string | null
  classes: { name: string } | null
  children: { full_name: string; parent_id: string } | null
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

    const tomorrow = addDays(istanbulToday(), 1)
    const tomorrowIso = tomorrow.toISOString().slice(0, 10)

    const { data: lessons, error } = await admin
      .from('lessons')
      .select(`
        id,
        child_id,
        scheduled_date,
        scheduled_time,
        classes!inner ( name ),
        children!inner ( full_name, parent_id )
      `)
      .eq('scheduled_date', tomorrowIso)
      .eq('status', 'scheduled')
      .returns<LessonRow[]>()

    if (error) throw error

    if (!lessons || lessons.length === 0) {
      return json({ created: 0, reason: 'no scheduled lessons tomorrow' })
    }

    // Dedup: son 6 saat içinde aynı (target_user, child_name) için bildirim
    // atılmış mı kontrol et. Eskiden parent bazlı dedup vardı — birden fazla
    // çocuklu velilerde 2. çocuğun bildirimi atlanıyordu. Şimdi child-name
    // body'de geçtiği için (target_user, body LIKE child_name) ile ayırıyoruz.
    const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    const { data: recent } = await admin
      .from('notifications')
      .select('target_user, body')
      .eq('type', 'lesson_tomorrow')
      .gt('created_at', cutoff)

    const sentKey = (parentId: string, childName: string) => `${parentId}|${childName}`
    const alreadySent = new Set<string>()
    for (const row of (recent ?? []) as { target_user: string | null; body: string | null }[]) {
      if (!row.target_user || !row.body) continue
      // body formatı: "{childName} için yarın ..."
      const m = row.body.match(/^(.+?) için yarın/)
      if (m) alreadySent.add(sentKey(row.target_user, m[1]))
    }

    let created = 0

    for (const l of lessons) {
      const parentId = l.children?.parent_id
      const childName = l.children?.full_name ?? ''
      if (!parentId || !childName) continue
      if (alreadySent.has(sentKey(parentId, childName))) continue

      const className = l.classes?.name ?? 'ders'
      const time = l.scheduled_time ? l.scheduled_time : ''

      const { data: inserted } = await admin
        .from('notifications')
        .insert({
          title: 'Yarın dersin var',
          body: `${childName} için yarın ${time ? time + ' ' : ''}${className} dersi var.`,
          type: 'lesson_tomorrow',
          target_user: parentId,
          link_url: '/veli/cocugum',
        })
        .select('id')
        .single()

      if (!inserted) continue
      alreadySent.add(sentKey(parentId, childName))
      created++

      void invokeSend(inserted.id)
    }

    return json({ created, lessons_tomorrow: lessons.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[lesson-reminder] fatal', message)
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
    console.error('[lesson-reminder] send invoke failed', err)
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

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

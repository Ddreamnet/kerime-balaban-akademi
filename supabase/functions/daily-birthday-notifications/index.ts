/**
 * daily-birthday-notifications
 *
 * Triggered daily by pg_cron (public.trigger_birthday_notifications at 09:00 UTC
 * = 12:00 TRT). Finds children whose birthday falls on today (matching
 * month+day in the parent's local timezone = TRT) and creates one notification
 * per parent, then invokes `send-notification` for each.
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ChildRow {
  id: string
  full_name: string
  birthday: string | null
  parent_id: string
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

    // "Today" is in Europe/Istanbul. pg_cron fires at 09:00 UTC so this is
    // always the same calendar day in TRT (UTC+3).
    const today = istanbulToday()
    const todayMonth = today.getMonth() + 1
    const todayDay = today.getDate()

    const { data: children, error } = await admin
      .from('children')
      .select('id, full_name, birthday, parent_id')
      .not('birthday', 'is', null)
      .returns<ChildRow[]>()

    if (error) throw error

    const todaysChildren = (children ?? []).filter((c) => {
      if (!c.birthday) return false
      const d = new Date(c.birthday)
      return d.getMonth() + 1 === todayMonth && d.getDate() === todayDay
    })

    if (todaysChildren.length === 0) {
      return json({ created: 0, reason: 'no birthdays today' })
    }

    // One notification per child (targets the parent directly).
    let created = 0
    for (const child of todaysChildren) {
      const { data: inserted } = await admin
        .from('notifications')
        .insert({
          title: `🎂 ${child.full_name} bugün doğum günü!`,
          body: `Sevgili velimiz, ${child.full_name}'nın doğum gününü tüm Kerime Balaban Akademi ailesi olarak kutlarız!`,
          type: 'birthday',
          target_role: null,
          target_user: child.parent_id,
          sent_by: null,
        })
        .select('id')
        .single()

      if (!inserted) continue
      created++

      // Fire-and-forget push delivery. Swallow errors; the row is there and
      // can be re-delivered manually if needed.
      void invokeSend(inserted.id)
    }

    return json({ created, children: todaysChildren.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[daily-birthday-notifications] fatal', message)
    return json({ error: message }, 500)
  }
})

/** Call the send-notification function internally. */
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
    console.error('[daily-birthday-notifications] send invoke failed', err)
  }
}

/** Returns the current date in Europe/Istanbul (UTC+3, no DST). */
function istanbulToday(): Date {
  const now = new Date()
  // Shift by +3h from UTC to get TRT.
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000
  return new Date(utc + 3 * 3600_000)
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

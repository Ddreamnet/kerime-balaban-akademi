/**
 * payment-reminders
 *
 * Triggered daily by pg_cron (public.trigger_payment_reminders at 17:00 UTC
 * = 20:00 TRT). Finds payments whose due_date is exactly 2 days from today
 * (TRT) and that are not yet paid, then creates one notification per parent
 * and invokes `send-notification` for each.
 *
 * Idempotency: payments.reminder_sent_at is stamped on success. The query
 * filters out rows where it is already set for today's reminder cycle, so
 * a re-run on the same day is a no-op.
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PaymentRow {
  id: string
  child_id: string
  due_date: string
  amount: number | null
  reminder_sent_at: string | null
  children: {
    full_name: string
    parent_id: string
  } | null
}

const REMINDER_BODY =
  'Değerli velimiz, ödeme tarihinize 2 gün kaldı. İlginiz için teşekkür ederiz.😊'
const REMINDER_TITLE = 'Ödeme Hatırlatması'

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

    // "Today" in Europe/Istanbul. The cron fires at 17:00 UTC so this is
    // always the same calendar day in TRT.
    const todayTrt = istanbulToday()
    const targetDate = addDays(todayTrt, 2)
    const targetIso = targetDate.toISOString().slice(0, 10)

    // Window of "already sent" — a row counts as already-reminded if its
    // reminder_sent_at falls within the last 36 hours. This avoids edge
    // cases at midnight UTC if the cron drifts.
    const cutoff = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()

    const { data: payments, error } = await admin
      .from('payments')
      .select(`
        id,
        child_id,
        due_date,
        amount,
        reminder_sent_at,
        children!inner (
          full_name,
          parent_id
        )
      `)
      .eq('due_date', targetIso)
      .neq('status', 'paid')
      .or(`reminder_sent_at.is.null,reminder_sent_at.lt.${cutoff}`)
      .returns<PaymentRow[]>()

    if (error) throw error

    if (!payments || payments.length === 0) {
      return json({ created: 0, reason: 'no payments due in 2 days' })
    }

    let created = 0
    const sentPaymentIds: string[] = []

    for (const p of payments) {
      const parentId = p.children?.parent_id
      if (!parentId) continue

      const { data: inserted } = await admin
        .from('notifications')
        .insert({
          title: REMINDER_TITLE,
          body: REMINDER_BODY,
          type: 'payment',
          target_role: null,
          target_user: parentId,
          sent_by: null,
          link_url: '/veli/odemeler',
        })
        .select('id')
        .single()

      if (!inserted) continue
      created++
      sentPaymentIds.push(p.id)

      // Fire-and-forget push delivery via send-notification.
      void invokeSend(inserted.id)
    }

    // Stamp idempotency marker. We do this even if the push is in-flight
    // because the notification row exists and the user will see it in their
    // inbox on next app open.
    if (sentPaymentIds.length > 0) {
      await admin
        .from('payments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .in('id', sentPaymentIds)
    }

    return json({ created, payments_due: payments.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[payment-reminders] fatal', message)
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
    console.error('[payment-reminders] send invoke failed', err)
  }
}

/** Returns the current date in Europe/Istanbul (UTC+3, no DST). */
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

/**
 * send-notification
 *
 * Input: { notification_id: string }
 *
 * Looks up the notification, resolves the recipient set from target_role /
 * target_user / target_user_ids, gathers their device tokens, and delivers
 * via FCM v1. Marks `sent_push_at` on success. Invalid tokens are pruned.
 *
 * Auth: requires service_role key OR an admin user JWT.
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  fcmProjectId,
  getAccessToken,
  sendToMany,
  type FcmMessage,
} from '../_shared/fcm.ts'

interface RequestBody {
  notification_id: string
}

interface NotificationRow {
  id: string
  title: string
  body: string
  target_role: string | null
  target_user: string | null
  target_user_ids: string[] | null
  type: string
  link_url: string | null
  sent_push_at: string | null
}

interface TokenRow {
  id: string
  user_id: string
  token: string
  platform: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { notification_id } = (await req.json()) as RequestBody
    if (!notification_id) {
      return json({ error: 'notification_id required' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const admin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    // ─── Authorize caller ────────────────────────────────────────────────────
    // verify_jwt is off (see supabase/config.toml) so we do the check here.
    // Accepted credentials:
    //   1. The project's service_role key — used by internal callers such as
    //      the daily-birthday cron function.
    //   2. A user JWT whose profile has role admin or coach and is approved.
    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!jwt) {
      return json({ error: 'unauthorized: missing bearer token' }, 401)
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const isServiceRole = jwt === serviceRoleKey

    if (!isServiceRole) {
      const { data: userData, error: userErr } = await admin.auth.getUser(jwt)
      if (userErr || !userData?.user) {
        console.warn('[send-notification] invalid JWT', userErr?.message)
        return json({ error: 'unauthorized: invalid token' }, 401)
      }

      const { data: callerProfile } = await admin
        .from('profiles')
        .select('role, is_active, approval_status')
        .eq('id', userData.user.id)
        .maybeSingle<{ role: string; is_active: boolean; approval_status: string }>()

      const canSend =
        callerProfile &&
        callerProfile.is_active &&
        callerProfile.approval_status === 'approved' &&
        (callerProfile.role === 'admin' || callerProfile.role === 'coach')

      if (!canSend) {
        return json({ error: 'forbidden: admin or coach role required' }, 403)
      }
    }

    // ─── Load notification ──────────────────────────────────────────────────
    const { data: notif, error: nErr } = await admin
      .from('notifications')
      .select('id, title, body, target_role, target_user, target_user_ids, type, link_url, sent_push_at')
      .eq('id', notification_id)
      .maybeSingle<NotificationRow>()

    if (nErr || !notif) {
      return json({ error: 'notification not found' }, 404)
    }

    if (notif.sent_push_at) {
      return json({ skipped: true, reason: 'already sent' })
    }

    // ─── Resolve recipients → user_ids ──────────────────────────────────────
    const userIds = await resolveRecipients(admin, notif)
    if (userIds.length === 0) {
      // Nothing to do, but don't mark as sent — a new matching user may
      // register later and we'd want a retry to reach them.
      return json({ delivered: 0, reason: 'no recipients' })
    }

    // ─── Fetch device tokens ────────────────────────────────────────────────
    const { data: tokens } = await admin
      .from('device_tokens')
      .select('id, user_id, token, platform')
      .in('user_id', userIds)
      .returns<TokenRow[]>()

    if (!tokens || tokens.length === 0) {
      // No device tokens to deliver to — users exist but have never
      // registered. Leave sent_push_at NULL so a later retry can pick up
      // newly-registered devices.
      return json({ delivered: 0, reason: 'no tokens' })
    }

    // ─── Deliver via FCM ────────────────────────────────────────────────────
    const accessToken = await getAccessToken()
    const projectId = fcmProjectId()

    const data: Record<string, string> = {
      notification_id: notif.id,
      type: notif.type,
    }
    if (notif.link_url) data.link_url = notif.link_url

    const messages: FcmMessage[] = tokens.map((t) => ({
      token: t.token,
      title: notif.title,
      body: notif.body,
      data,
    }))

    const results = await sendToMany(accessToken, projectId, messages)

    // Prune tokens that FCM rejected as invalid/unregistered.
    const invalidTokenIds = tokens
      .filter((t, i) => results[i]?.tokenInvalid)
      .map((t) => t.id)
    if (invalidTokenIds.length > 0) {
      await admin.from('device_tokens').delete().in('id', invalidTokenIds)
    }

    const succeeded = results.filter((r) => r.success).length
    const failedResults = results.filter((r) => !r.success)

    // Surface any FCM-level error so we can diagnose silent delivery
    // failures from the function logs without shipping PII.
    if (failedResults.length > 0) {
      console.error(
        '[send-notification] FCM failures',
        failedResults.slice(0, 5).map((r) => r.error),
      )
    }

    // Only mark as "sent" when at least one device accepted the payload.
    // A total failure (e.g. all tokens invalid or FCM misconfigured) must
    // remain retryable.
    if (succeeded > 0) {
      await admin
        .from('notifications')
        .update({ sent_push_at: new Date().toISOString() })
        .eq('id', notif.id)
    }

    return json({
      delivered: succeeded,
      failed: results.length - succeeded,
      pruned_tokens: invalidTokenIds.length,
      first_errors: failedResults.slice(0, 3).map((r) => r.error),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[send-notification] fatal', message)
    return json({ error: message }, 500)
  }
})

async function resolveRecipients(
  admin: ReturnType<typeof createClient>,
  notif: NotificationRow,
): Promise<string[]> {
  // Multi-user target takes precedence.
  if (notif.target_user_ids && notif.target_user_ids.length > 0) {
    return notif.target_user_ids
  }

  if (notif.target_user) {
    return [notif.target_user]
  }

  // Role targeting — 'all' or a specific role.
  if (notif.target_role === 'all' || !notif.target_role) {
    const { data } = await admin
      .from('profiles')
      .select('id')
      .eq('is_active', true)
      .eq('approval_status', 'approved')
      .returns<Array<{ id: string }>>()
    return (data ?? []).map((r) => r.id)
  }

  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('role', notif.target_role)
    .eq('is_active', true)
    .eq('approval_status', 'approved')
    .returns<Array<{ id: string }>>()
  return (data ?? []).map((r) => r.id)
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

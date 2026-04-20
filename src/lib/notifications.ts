/**
 * In-app notifications service.
 * Push-notification wiring lives separately in lib/capacitor.ts.
 */

import { supabase } from './supabase'
import type { UserRole } from '@/types/auth.types'
import {
  PushNotifications as CapPushBridge,
  LocalNotifications as CapLocalBridge,
  getPlatform,
  isNativePlatform,
} from './capacitor'

/** Payload attached to a push delivery by the send-notification edge function. */
export interface PushPayload {
  notification_id?: string
  type?: NotificationType
  link_url?: string
  [key: string]: unknown
}

export type NotificationType = 'general' | 'birthday' | 'payment' | 'exam' | 'attendance'
export type NotificationTarget = 'all' | UserRole

export interface AppNotification {
  id: string
  title: string
  body: string
  target_role: NotificationTarget | null
  target_user: string | null
  target_user_ids: string[] | null
  sent_by: string | null
  sent_push_at: string | null
  type: NotificationType
  link_url: string | null
  created_at: string
}

export interface NotificationWithRead extends AppNotification {
  is_read: boolean
}

export interface ComposeInput {
  title: string
  body: string
  /** 'all' / 'admin' / 'coach' / 'parent' — ignored when target_user_ids is provided */
  target_role?: NotificationTarget
  /** Single-user target (legacy) */
  target_user?: string | null
  /** Multi-user target — takes precedence over target_role when non-empty */
  target_user_ids?: string[] | null
  type?: NotificationType
  link_url?: string | null
}

function mapNotification(row: {
  id: string
  title: string
  body: string
  target_role: string | null
  target_user: string | null
  target_user_ids?: string[] | null
  sent_by: string | null
  sent_push_at?: string | null
  type: string
  link_url: string | null
  created_at: string
}): AppNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    target_role: (row.target_role as NotificationTarget | null) ?? null,
    target_user: row.target_user,
    target_user_ids: row.target_user_ids ?? null,
    sent_by: row.sent_by,
    sent_push_at: row.sent_push_at ?? null,
    type: row.type as NotificationType,
    link_url: row.link_url,
    created_at: row.created_at,
  }
}

// ─── User-facing (inbox) ────────────────────────────────────────────────────

/**
 * List notifications visible to the current user with read status.
 * RLS ensures only relevant rows are returned.
 */
export async function listMyNotifications(userId: string): Promise<NotificationWithRead[]> {
  const [{ data: notifs, error: nErr }, { data: reads, error: rErr }] = await Promise.all([
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('notification_reads').select('notification_id').eq('user_id', userId),
  ])

  if (nErr || rErr || !notifs) return []

  const readIds = new Set((reads ?? []).map((r) => r.notification_id))

  return notifs.map((n) => ({
    ...mapNotification(n),
    is_read: readIds.has(n.id),
  }))
}

/** Count unread notifications for a user */
export async function getUnreadCount(userId: string): Promise<number> {
  const list = await listMyNotifications(userId)
  return list.filter((n) => !n.is_read).length
}

export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('notification_reads')
    .upsert(
      { notification_id: notificationId, user_id: userId },
      { onConflict: 'notification_id,user_id' },
    )
  return { error: error?.message ?? null }
}

export async function markAllAsRead(
  notificationIds: string[],
  userId: string,
): Promise<{ error: string | null }> {
  if (notificationIds.length === 0) return { error: null }
  const rows = notificationIds.map((id) => ({ notification_id: id, user_id: userId }))
  const { error } = await supabase
    .from('notification_reads')
    .upsert(rows, { onConflict: 'notification_id,user_id' })
  return { error: error?.message ?? null }
}

// ─── Admin (compose + history) ──────────────────────────────────────────────

export async function sendNotification(
  input: ComposeInput,
  sentBy: string | null,
): Promise<{ notification: AppNotification | null; error: string | null }> {
  const hasUserIds = (input.target_user_ids?.length ?? 0) > 0
  // When specific users are selected, target_role is meaningless — clear it
  // so RLS doesn't accidentally widen visibility.
  const targetRole = hasUserIds ? null : (input.target_role ?? 'all')

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      title: input.title,
      body: input.body,
      target_role: targetRole,
      target_user: input.target_user ?? null,
      target_user_ids: hasUserIds ? input.target_user_ids! : null,
      type: input.type ?? 'general',
      link_url: input.link_url ?? null,
      sent_by: sentBy,
    })
    .select('*')
    .single()

  if (error || !data) {
    return { notification: null, error: error?.message ?? 'Gönderme başarısız.' }
  }

  // Fire-and-forget push delivery via edge function. The notification row
  // is already saved for the in-app inbox; push is best-effort on top of that.
  void supabase.functions
    .invoke('send-notification', { body: { notification_id: data.id } })
    .catch((err) => console.error('[sendNotification] push invoke failed', err))

  return { notification: mapNotification(data), error: null }
}

export async function listAllNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error || !data) return []
  return data.map(mapNotification)
}

export async function deleteNotification(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ─── Type labels ─────────────────────────────────────────────────────────────

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  general: 'Genel',
  birthday: 'Doğum Günü',
  payment: 'Ödeme',
  exam: 'Sınav',
  attendance: 'Devamsızlık',
}

export const TARGET_LABELS: Record<NotificationTarget, string> = {
  all: 'Herkes',
  admin: 'Yöneticiler',
  coach: 'Antrenörler',
  parent: 'Veliler',
}

// ─── Push / device registration ─────────────────────────────────────────────

/**
 * Called once per authenticated native session:
 *   1. Ask the OS for push permission.
 *   2. Register with FCM/APNs and obtain a device token.
 *   3. Upsert the token into `device_tokens` so the backend can target it.
 *
 * No-op on web.
 */
export async function registerPushForUser(userId: string): Promise<void> {
  if (!isNativePlatform()) {
    console.debug('[push] skipped — not on native platform')
    return
  }

  const granted = await CapPushBridge.requestPermission()
  if (!granted) {
    console.warn('[push] permission not granted — device will not receive notifications')
    return
  }

  // Also ensure local-notification permission (birthday reminders, etc.).
  await CapLocalBridge.requestPermission()

  const token = await CapPushBridge.getToken()
  if (!token) {
    console.error('[push] no FCM token returned — check Firebase / Google Play Services')
    return
  }

  const platform = getPlatform()
  const now = new Date().toISOString()

  console.info('[push] upserting token for user', userId, 'platform', platform)

  // Upsert on the (user_id, token) unique index — fresh rows get inserted,
  // known rows just update last_used_at.
  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      { user_id: userId, token, platform, last_used_at: now, last_error: null },
      { onConflict: 'user_id,token' },
    )

  if (error) {
    console.error('[push] failed to save device token', error)
  } else {
    console.info('[push] device token saved')
  }
}

/**
 * Remove the current device's token on sign-out so the backend stops
 * targeting this device. Safe to call from any platform.
 */
export async function unregisterPushForUser(userId: string): Promise<void> {
  if (!isNativePlatform()) return

  const token = await CapPushBridge.getToken()
  if (!token) return

  await supabase
    .from('device_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('token', token)
}

// ─── Push listeners (foreground + tap) ──────────────────────────────────────

/**
 * Wire foreground + tap listeners once per app session.
 *
 * - `onForeground`: fired when a push arrives while the app is open.
 *   iOS will still show the system banner (presentationOptions in config);
 *   Android will also show a system notification. Use this callback for
 *   in-app toasts, badge refreshes, etc.
 *
 * - `onTap`: fired when the user taps a delivered notification. Phase 2 will
 *   use this to open a dialog or deep-link to a page.
 */
export function registerPushListeners(handlers: {
  onForeground?: (payload: { title: string; body: string; data: PushPayload }) => void
  onTap?: (data: PushPayload) => void
}): void {
  if (!isNativePlatform()) return

  if (handlers.onForeground) {
    CapPushBridge.onReceived((n) => {
      handlers.onForeground!({ title: n.title, body: n.body, data: n.data as PushPayload })
    })
  }

  if (handlers.onTap) {
    CapPushBridge.onTapped((data) => {
      handlers.onTap!(data as PushPayload)
    })
  }
}

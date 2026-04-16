/**
 * In-app notifications service.
 * Push-notification wiring lives separately in lib/capacitor.ts.
 */

import { supabase } from './supabase'
import type { UserRole } from '@/types/auth.types'

export type NotificationType = 'general' | 'birthday' | 'payment' | 'exam' | 'attendance'
export type NotificationTarget = 'all' | UserRole

export interface AppNotification {
  id: string
  title: string
  body: string
  target_role: NotificationTarget | null
  target_user: string | null
  sent_by: string | null
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
  target_role?: NotificationTarget
  target_user?: string | null
  type?: NotificationType
  link_url?: string | null
}

function mapNotification(row: {
  id: string
  title: string
  body: string
  target_role: string | null
  target_user: string | null
  sent_by: string | null
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
    sent_by: row.sent_by,
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
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      title: input.title,
      body: input.body,
      target_role: input.target_role ?? 'all',
      target_user: input.target_user ?? null,
      type: input.type ?? 'general',
      link_url: input.link_url ?? null,
      sent_by: sentBy,
    })
    .select('*')
    .single()

  if (error || !data) return { notification: null, error: error?.message ?? 'Gönderme başarısız.' }
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

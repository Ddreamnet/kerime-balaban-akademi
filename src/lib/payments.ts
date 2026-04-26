/**
 * Payments service — per-child billing cycles.
 *
 * Each payment row represents one billing period and carries explicit
 * period_start / period_end / due_date columns. The legacy
 * period_month / period_year pair is still written for backward compatibility;
 * new UI relies on the date columns.
 *
 * The DB column `status` may hold 'paid' | 'unpaid' | 'late'. Going forward,
 * `late` is no longer set by the system — it is computed at read time from
 * due_date vs today via `derivePaymentStatus()`. Existing legacy `late` rows
 * are accepted and shown as overdue.
 */

import { supabase } from './supabase'

export type PaymentStatus = 'paid' | 'unpaid' | 'late'

/** UI-facing status — `overdue` is computed, never stored. */
export type DerivedPaymentStatus = 'paid' | 'pending' | 'overdue'

export interface PaymentRecord {
  id: string
  child_id: string
  period_month: number
  period_year: number
  period_start: string
  period_end: string
  due_date: string
  amount: number | null
  status: PaymentStatus
  paid_at: string | null
  paid_by_id: string | null
  note: string | null
  reminder_sent_at: string | null
  created_at: string
  updated_at: string
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Ödendi',
  unpaid: 'Ödenmedi',
  late: 'Gecikmiş',
}

export const DERIVED_PAYMENT_STATUS_LABELS: Record<DerivedPaymentStatus, string> = {
  paid: 'Ödendi',
  pending: 'Bekliyor',
  overdue: 'Gecikmiş',
}

export const TURKISH_MONTHS: string[] = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

export function formatPeriod(month: number, year: number): string {
  return `${TURKISH_MONTHS[month - 1]} ${year}`
}

/**
 * Format a period range like "18 Mart → 17 Nisan 2026". Year is shown only
 * on the end date when both endpoints share the same calendar year.
 */
export function formatPeriodRange(periodStart: string, periodEnd: string): string {
  const s = new Date(periodStart)
  const e = new Date(periodEnd)
  const sameYear = s.getFullYear() === e.getFullYear()
  const startStr = sameYear
    ? `${s.getDate()} ${TURKISH_MONTHS[s.getMonth()]}`
    : `${s.getDate()} ${TURKISH_MONTHS[s.getMonth()]} ${s.getFullYear()}`
  const endStr = `${e.getDate()} ${TURKISH_MONTHS[e.getMonth()]} ${e.getFullYear()}`
  return `${startStr} → ${endStr}`
}

/** Format an ISO date as "25 Mart 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${TURKISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function currentPeriod(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

/**
 * Derive UI status from stored status + due_date. Stored `late` maps to
 * `overdue` for legacy rows. New rows are `unpaid` until paid; their derived
 * status flips to `overdue` once due_date < today.
 */
export function derivePaymentStatus(record: PaymentRecord, now = new Date()): DerivedPaymentStatus {
  if (record.status === 'paid') return 'paid'
  const due = new Date(record.due_date)
  due.setHours(0, 0, 0, 0)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  if (today.getTime() > due.getTime()) return 'overdue'
  return 'pending'
}

/** Days until due (negative if overdue). */
export function daysUntilDue(dueDate: string, now = new Date()): number {
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

interface PaymentRow {
  id: string
  child_id: string
  period_month: number
  period_year: number
  period_start: string
  period_end: string
  due_date: string
  amount: number | null
  status: string
  paid_at: string | null
  paid_by_id: string | null
  note: string | null
  reminder_sent_at: string | null
  created_at: string
  updated_at: string
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    child_id: row.child_id,
    period_month: row.period_month,
    period_year: row.period_year,
    period_start: row.period_start,
    period_end: row.period_end,
    due_date: row.due_date,
    amount: row.amount,
    status: row.status as PaymentStatus,
    paid_at: row.paid_at,
    paid_by_id: row.paid_by_id,
    note: row.note,
    reminder_sent_at: row.reminder_sent_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/** Parent / admin / coach: all payment rows for a single child (newest first) */
export async function listPaymentsForChild(childId: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('child_id', childId)
    .order('period_start', { ascending: false })

  if (error || !data) return []
  return data.map(mapPayment)
}

/** Admin: all payment rows for a specific (month, year). Legacy grid view. */
export async function listPaymentsForPeriod(
  month: number,
  year: number,
): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('period_month', month)
    .eq('period_year', year)

  if (error || !data) return []
  return data.map(mapPayment)
}

/**
 * Admin: payments with due_date in [from, to]. Used by new active-period
 * dashboards.
 */
export async function listPaymentsDueBetween(
  fromIso: string,
  toIso: string,
): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .gte('due_date', fromIso)
    .lte('due_date', toIso)
    .order('due_date', { ascending: true })

  if (error || !data) return []
  return data.map(mapPayment)
}

/**
 * Update a single payment row by id. Preferred entry point for the new
 * AdminPaymentsPage. status='paid' auto-fills paid_at/paid_by_id; switching
 * back to 'unpaid' clears them.
 */
export async function updatePaymentById(input: {
  id: string
  status: PaymentStatus
  amount?: number | null
  note?: string | null
  paidByAdminId?: string | null
}): Promise<{ record: PaymentRecord | null; error: string | null }> {
  const patch: Partial<PaymentRow> = { status: input.status }
  if (input.amount !== undefined) patch.amount = input.amount
  if (input.note !== undefined) patch.note = input.note

  if (input.status === 'paid') {
    patch.paid_at = new Date().toISOString()
    if (input.paidByAdminId !== undefined) patch.paid_by_id = input.paidByAdminId
  } else {
    patch.paid_at = null
    patch.paid_by_id = null
  }

  const { data, error } = await supabase
    .from('payments')
    .update(patch)
    .eq('id', input.id)
    .select('*')
    .single()

  if (error || !data) return { record: null, error: error?.message ?? 'Kayıt başarısız.' }
  return { record: mapPayment(data), error: null }
}

export async function deletePayment(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payments').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ─── Billing config (children) ─────────────────────────────────────────────

export interface ChildBillingConfig {
  billing_start_date: string | null
  payment_due_day: number | null
}

/**
 * Set or update a child's billing anchor. The DB trigger generates /
 * regenerates 12 future periods. Pass nulls to clear the schedule.
 *
 * payment_due_day defaults to the day-of-month of billing_start_date when
 * passed as null (resolved by the trigger).
 */
export async function setChildBillingConfig(
  childId: string,
  config: ChildBillingConfig,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('children')
    .update({
      billing_start_date: config.billing_start_date,
      payment_due_day: config.payment_due_day,
    })
    .eq('id', childId)

  return { error: error?.message ?? null }
}

/**
 * Children whose billing schedule has not been configured yet — surfaced on
 * the AdminDashboard as a "needs attention" card.
 */
export async function listChildrenWithoutBilling(): Promise<
  Array<{ id: string; full_name: string; parent_id: string }>
> {
  const { data, error } = await supabase
    .from('children')
    .select('id, full_name, parent_id')
    .is('billing_start_date', null)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data
}

// ─── Summary helpers ────────────────────────────────────────────────────────

export interface PaymentSummary {
  /** Legacy fields — use *Count fields below in new code. */
  paidMonths: number
  unpaidMonths: number
  lateMonths: number
  /** Total record count regardless of status. */
  totalMonths: number
  /** Sum of amount for paid rows. */
  totalPaid: number
  /** Counts using derived status (overdue computed from due_date). */
  paidCount: number
  pendingCount: number
  overdueCount: number
}

/**
 * Aggregate counts and totals. Both legacy field names (paidMonths, ...) and
 * derived-status counts are emitted so the existing UI continues to render
 * while pages are migrated.
 */
export function computePaymentSummary(
  records: PaymentRecord[],
  now = new Date(),
): PaymentSummary {
  let paidMonths = 0
  let unpaidMonths = 0
  let lateMonths = 0
  let paidCount = 0
  let pendingCount = 0
  let overdueCount = 0
  let totalPaid = 0

  for (const r of records) {
    if (r.status === 'paid') paidMonths++
    else if (r.status === 'unpaid') unpaidMonths++
    else if (r.status === 'late') lateMonths++

    const derived = derivePaymentStatus(r, now)
    if (derived === 'paid') {
      paidCount++
      if (r.amount !== null) totalPaid += r.amount
    } else if (derived === 'pending') pendingCount++
    else if (derived === 'overdue') overdueCount++
  }

  return {
    paidMonths,
    unpaidMonths,
    lateMonths,
    totalMonths: records.length,
    totalPaid,
    paidCount,
    pendingCount,
    overdueCount,
  }
}

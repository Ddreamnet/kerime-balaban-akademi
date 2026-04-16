/**
 * Payments service — monthly fee tracking per child.
 */

import { supabase } from './supabase'

export type PaymentStatus = 'paid' | 'unpaid' | 'late'

export interface PaymentRecord {
  id: string
  child_id: string
  period_month: number
  period_year: number
  amount: number | null
  status: PaymentStatus
  paid_at: string | null
  paid_by_id: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Ödendi',
  unpaid: 'Ödenmedi',
  late: 'Gecikmiş',
}

export const TURKISH_MONTHS: string[] = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

export function formatPeriod(month: number, year: number): string {
  return `${TURKISH_MONTHS[month - 1]} ${year}`
}

export function currentPeriod(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

function mapPayment(row: {
  id: string
  child_id: string
  period_month: number
  period_year: number
  amount: number | null
  status: string
  paid_at: string | null
  paid_by_id: string | null
  note: string | null
  created_at: string
  updated_at: string
}): PaymentRecord {
  return {
    id: row.id,
    child_id: row.child_id,
    period_month: row.period_month,
    period_year: row.period_year,
    amount: row.amount,
    status: row.status as PaymentStatus,
    paid_at: row.paid_at,
    paid_by_id: row.paid_by_id,
    note: row.note,
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
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })

  if (error || !data) return []
  return data.map(mapPayment)
}

/** Admin: all payment rows for a specific month/year */
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

export interface PaymentUpsertInput {
  childId: string
  month: number
  year: number
  status: PaymentStatus
  amount?: number | null
  note?: string | null
  paidByAdminId?: string | null
}

/**
 * Create or update a payment row for (child, month, year).
 * If status is 'paid', paid_at is stamped automatically.
 */
export async function upsertPayment(
  input: PaymentUpsertInput,
): Promise<{ record: PaymentRecord | null; error: string | null }> {
  const row = {
    child_id: input.childId,
    period_month: input.month,
    period_year: input.year,
    status: input.status,
    amount: input.amount ?? null,
    note: input.note ?? null,
    paid_at: input.status === 'paid' ? new Date().toISOString() : null,
    paid_by_id: input.status === 'paid' ? (input.paidByAdminId ?? null) : null,
  }

  const { data, error } = await supabase
    .from('payments')
    .upsert(row, { onConflict: 'child_id,period_month,period_year' })
    .select('*')
    .single()

  if (error || !data) return { record: null, error: error?.message ?? 'Kayıt başarısız.' }
  return { record: mapPayment(data), error: null }
}

export async function deletePayment(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payments').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ─── Summary helpers ────────────────────────────────────────────────────────

export interface PaymentSummary {
  paidMonths: number
  unpaidMonths: number
  lateMonths: number
  totalMonths: number
  totalPaid: number
}

export function computePaymentSummary(records: PaymentRecord[]): PaymentSummary {
  const paidMonths = records.filter((r) => r.status === 'paid').length
  const unpaidMonths = records.filter((r) => r.status === 'unpaid').length
  const lateMonths = records.filter((r) => r.status === 'late').length
  const totalPaid = records
    .filter((r) => r.status === 'paid' && r.amount !== null)
    .reduce((sum, r) => sum + (r.amount ?? 0), 0)
  return {
    paidMonths,
    unpaidMonths,
    lateMonths,
    totalMonths: records.length,
    totalPaid,
  }
}

/**
 * Coach-branches m2m service.
 *
 * Bir koç birden fazla branşta öğretebilir, bir branşta birden fazla koç
 * olabilir. RLS bu tablo üzerinden scope sağlar: koç sadece atandığı
 * branşların lesson/package'larını görür.
 */

import { supabase } from './supabase'
import type { Branch } from './branches'

export interface CoachBranchAssignment {
  coach_id: string
  branch_id: string
  assigned_at: string
  assigned_by: string | null
}

/** Bir koçun atandığı tüm branşlar */
export async function listBranchesForCoach(coachId: string): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('coach_branches')
    .select(`
      branch_id,
      branches!inner (
        id, code, name, billing_model, default_package_size, default_price,
        is_active, sort_order, created_at, updated_at
      )
    `)
    .eq('coach_id', coachId)

  if (error || !data) return []

  return data
    .map((row) => {
      const b = (Array.isArray(row.branches) ? row.branches[0] : row.branches) as
        | (Branch & { billing_model: string })
        | null
      if (!b) return null
      return {
        ...b,
        billing_model: b.billing_model as Branch['billing_model'],
      } as Branch
    })
    .filter((b): b is Branch => b !== null)
}

/** Bir branşa atanmış tüm koç ID'leri */
export async function listCoachIdsForBranch(branchId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('coach_branches')
    .select('coach_id')
    .eq('branch_id', branchId)

  if (error || !data) return []
  return data.map((r: { coach_id: string }) => r.coach_id)
}

/** Admin: bir koçu bir branşa ata */
export async function assignCoachToBranch(
  coachId: string,
  branchId: string,
  assignedBy: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('coach_branches')
    .insert({
      coach_id: coachId,
      branch_id: branchId,
      assigned_by: assignedBy,
    })

  if (error && error.code === '23505') {
    return { error: null } // zaten atanmış, idempotent
  }
  return { error: error?.message ?? null }
}

/** Admin: bir koçun bir branş atamasını kaldır */
export async function removeCoachFromBranch(
  coachId: string,
  branchId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('coach_branches')
    .delete()
    .eq('coach_id', coachId)
    .eq('branch_id', branchId)

  return { error: error?.message ?? null }
}

/**
 * Admin: bir koçun branş atamalarını topluca güncelle (mevcut → istenen set'e).
 * Idempotent: önce mevcut atamaları silmeyip yeni eklemeleri ve eksik silinenleri yapar.
 */
export async function syncCoachBranches(
  coachId: string,
  desiredBranchIds: string[],
  assignedBy: string,
): Promise<{ error: string | null }> {
  const { data: current, error: fetchError } = await supabase
    .from('coach_branches')
    .select('branch_id')
    .eq('coach_id', coachId)

  if (fetchError) return { error: fetchError.message }

  const currentIds = new Set((current ?? []).map((r: { branch_id: string }) => r.branch_id))
  const desiredIds = new Set(desiredBranchIds)

  const toAdd = desiredBranchIds.filter((id) => !currentIds.has(id))
  const toRemove = [...currentIds].filter((id) => !desiredIds.has(id))

  if (toAdd.length > 0) {
    const { error: insertError } = await supabase
      .from('coach_branches')
      .insert(toAdd.map((branch_id) => ({ coach_id: coachId, branch_id, assigned_by: assignedBy })))
    if (insertError) return { error: insertError.message }
  }

  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('coach_branches')
      .delete()
      .eq('coach_id', coachId)
      .in('branch_id', toRemove)
    if (deleteError) return { error: deleteError.message }
  }

  return { error: null }
}

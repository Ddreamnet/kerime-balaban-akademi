/**
 * Branches service — spor branşları (taekwondo, kickboks, cimnastik, ...).
 *
 * billing_model:
 *   'monthly' → aylık abonelik (taekwondo). period_start/end + due_date ile.
 *   'package' → 8-derslik paket (kickboks, cimnastik). packages tablosu üzerinden.
 *
 * default_price ve default_package_size paket branşlarında baz değer.
 * Per-student override için children.package_price_override kullanılır.
 */

import { supabase } from './supabase'

export type BillingModel = 'monthly' | 'package'

export interface Branch {
  id: string
  code: string
  name: string
  billing_model: BillingModel
  default_package_size: number
  default_price: number | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BranchInput {
  code: string
  name: string
  billing_model: BillingModel
  default_package_size?: number
  default_price?: number | null
  is_active?: boolean
  sort_order?: number
}

function mapBranch(row: {
  id: string
  code: string
  name: string
  billing_model: string
  default_package_size: number
  default_price: number | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}): Branch {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    billing_model: row.billing_model as BillingModel,
    default_package_size: row.default_package_size,
    default_price: row.default_price,
    is_active: row.is_active,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/** Public: only active branches (parent/coach UI) */
export async function listActiveBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data.map(mapBranch)
}

/** Admin: all branches including inactive */
export async function listAllBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data.map(mapBranch)
}

export async function getBranchById(id: string): Promise<Branch | null> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return mapBranch(data)
}

export async function getBranchByCode(code: string): Promise<Branch | null> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (error || !data) return null
  return mapBranch(data)
}

export async function createBranch(
  input: BranchInput,
): Promise<{ branch: Branch | null; error: string | null }> {
  const { data, error } = await supabase
    .from('branches')
    .insert({
      code: input.code,
      name: input.name,
      billing_model: input.billing_model,
      default_package_size: input.default_package_size ?? 8,
      default_price: input.default_price ?? null,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single()

  if (error || !data) return { branch: null, error: error?.message ?? 'Oluşturma başarısız.' }
  return { branch: mapBranch(data), error: null }
}

export async function updateBranch(
  id: string,
  input: Partial<BranchInput>,
): Promise<{ branch: Branch | null; error: string | null }> {
  const { data, error } = await supabase
    .from('branches')
    .update({
      ...(input.code !== undefined && { code: input.code }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.billing_model !== undefined && { billing_model: input.billing_model }),
      ...(input.default_package_size !== undefined && {
        default_package_size: input.default_package_size,
      }),
      ...(input.default_price !== undefined && { default_price: input.default_price }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { branch: null, error: error?.message ?? 'Güncelleme başarısız.' }
  return { branch: mapBranch(data), error: null }
}

/**
 * Branş'ı pasif yap (silmek yerine). Aktif paket veya öğrenci varsa
 * tamamen silmek RESTRICT FK yüzünden başarısız olur; pasif yapmak güvenlidir.
 */
export async function deactivateBranch(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('branches')
    .update({ is_active: false })
    .eq('id', id)

  return { error: error?.message ?? null }
}

/**
 * Branş için kayıtlı toplam çocuk sayısı (admin "kaç öğrenci?" göstergesi).
 */
export async function getChildrenCountByBranch(branchId: string): Promise<number> {
  const { count, error } = await supabase
    .from('children')
    .select('id', { count: 'exact', head: true })
    .eq('branch_id', branchId)

  if (error || count === null) return 0
  return count
}

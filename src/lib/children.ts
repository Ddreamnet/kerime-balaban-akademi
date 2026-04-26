/**
 * Children service — all Supabase queries related to children.
 * Pages import from here, never call supabase.from('children') directly.
 */

import { supabase } from './supabase'
import type { BeltLevel } from '@/types/content.types'

export type Gender = 'erkek' | 'kiz'

export interface Child {
  id: string
  parent_id: string
  full_name: string
  birthday: string | null
  class_group_id: string | null
  belt_level: BeltLevel | null
  avatar_url: string | null
  notes: string | null
  gender: Gender | null
  tc_no: string | null
  license_no: string | null
  start_date: string | null
  coach_note: string | null
  /** Anchor date for the per-child billing cycle (ISO YYYY-MM-DD). */
  billing_start_date: string | null
  /** Day-of-month payment is due (1-31). Defaults to billing_start_date.day. */
  payment_due_day: number | null
  created_at: string
  updated_at: string
}

export interface ChildInput {
  full_name: string
  birthday?: string | null
  class_group_id?: string | null
  belt_level?: BeltLevel | null
  avatar_url?: string | null
  notes?: string | null
  gender?: Gender | null
  tc_no?: string | null
  license_no?: string | null
  start_date?: string | null
  coach_note?: string | null
}

function mapChild(row: {
  id: string
  parent_id: string
  full_name: string
  birthday: string | null
  class_group_id: string | null
  belt_level: string | null
  avatar_url: string | null
  notes: string | null
  gender: string | null
  tc_no: string | null
  license_no: string | null
  start_date: string | null
  coach_note: string | null
  billing_start_date?: string | null
  payment_due_day?: number | null
  created_at: string
  updated_at: string
}): Child {
  return {
    id: row.id,
    parent_id: row.parent_id,
    full_name: row.full_name,
    birthday: row.birthday,
    class_group_id: row.class_group_id,
    belt_level: (row.belt_level as BeltLevel | null) ?? null,
    avatar_url: row.avatar_url,
    notes: row.notes,
    gender: (row.gender as Gender | null) ?? null,
    tc_no: row.tc_no,
    license_no: row.license_no,
    start_date: row.start_date,
    coach_note: row.coach_note,
    billing_start_date: row.billing_start_date ?? null,
    payment_due_day: row.payment_due_day ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// ─── Parent: get/create/update own child ────────────────────────────────────

/**
 * Fetch the parent's primary (first) child.
 * Returns null if the parent hasn't registered a child yet.
 */
export async function getMyChild(parentId: string): Promise<Child | null> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return mapChild(data)
}

export async function createChild(
  parentId: string,
  input: ChildInput,
): Promise<{ child: Child | null; error: string | null }> {
  const { data, error } = await supabase
    .from('children')
    .insert({
      parent_id: parentId,
      full_name: input.full_name,
      birthday: input.birthday ?? null,
      class_group_id: input.class_group_id ?? null,
      belt_level: input.belt_level ?? null,
      avatar_url: input.avatar_url ?? null,
      notes: input.notes ?? null,
      gender: input.gender ?? null,
      tc_no: input.tc_no ?? null,
      license_no: input.license_no ?? null,
      start_date: input.start_date ?? null,
      coach_note: input.coach_note ?? null,
    })
    .select('*')
    .single()

  if (error || !data) return { child: null, error: error?.message ?? 'Kayıt başarısız.' }
  return { child: mapChild(data), error: null }
}

export async function updateChild(
  childId: string,
  input: Partial<ChildInput>,
): Promise<{ child: Child | null; error: string | null }> {
  const { data, error } = await supabase
    .from('children')
    .update(input)
    .eq('id', childId)
    .select('*')
    .single()

  if (error || !data) return { child: null, error: error?.message ?? 'Güncelleme başarısız.' }
  return { child: mapChild(data), error: null }
}

// ─── Admin/Coach: list children ─────────────────────────────────────────────

export interface ChildWithParent extends Child {
  parent_email: string
  parent_name: string
  parent_phone: string | null
  parent_avatar_url: string | null
  parent_is_active: boolean
}

export async function listAllChildren(): Promise<ChildWithParent[]> {
  const { data, error } = await supabase
    .from('children')
    .select(`
      id,
      parent_id,
      full_name,
      birthday,
      class_group_id,
      belt_level,
      avatar_url,
      notes,
      gender,
      tc_no,
      license_no,
      start_date,
      coach_note,
      billing_start_date,
      payment_due_day,
      created_at,
      updated_at,
      profiles!children_parent_id_fkey (
        email,
        full_name,
        phone,
        avatar_url,
        is_active
      )
    `)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => {
    type ProfileJoin = {
      email: string
      full_name: string
      phone: string | null
      avatar_url: string | null
      is_active: boolean
    }
    const parent = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
      | ProfileJoin
      | null
    return {
      ...mapChild(row),
      parent_email: parent?.email ?? '',
      parent_name: parent?.full_name ?? '',
      parent_phone: parent?.phone ?? null,
      parent_avatar_url: parent?.avatar_url ?? null,
      parent_is_active: parent?.is_active ?? true,
    }
  })
}

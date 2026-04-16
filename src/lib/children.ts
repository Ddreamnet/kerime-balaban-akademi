/**
 * Children service — all Supabase queries related to children.
 * Pages import from here, never call supabase.from('children') directly.
 */

import { supabase } from './supabase'
import type { BeltLevel } from '@/types/content.types'

export interface Child {
  id: string
  parent_id: string
  full_name: string
  birthday: string | null
  class_group_id: string | null
  belt_level: BeltLevel | null
  avatar_url: string | null
  notes: string | null
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
      created_at,
      updated_at,
      profiles!children_parent_id_fkey (
        email,
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => {
    type ProfileJoin = { email: string; full_name: string; phone: string | null }
    const parent = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
      | ProfileJoin
      | null
    return {
      ...mapChild(row),
      parent_email: parent?.email ?? '',
      parent_name: parent?.full_name ?? '',
      parent_phone: parent?.phone ?? null,
    }
  })
}

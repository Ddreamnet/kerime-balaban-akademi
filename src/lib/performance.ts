/**
 * Performance records service — CRUD for performance_records and related photos.
 *
 * Access is enforced by RLS: parents see their own child's records/photos,
 * coaches and admins have full access.
 */

import { supabase } from './supabase'

export interface PerformancePhoto {
  id: string
  record_id: string
  url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export interface PerformanceRecord {
  id: string
  child_id: string
  recorded_at: string
  recorded_by: string | null
  recorded_by_name: string | null
  height_cm: number | null
  weight_kg: number | null
  split_cm: number | null
  forward_reach_cm: number | null
  jump_cm: number | null
  technique_notes: string | null
  general_note: string | null
  exam_ready: boolean
  photos: PerformancePhoto[]
  created_at: string
  updated_at: string
}

export interface PerformanceRecordInput {
  child_id: string
  recorded_at?: string
  recorded_by?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  split_cm?: number | null
  forward_reach_cm?: number | null
  jump_cm?: number | null
  technique_notes?: string | null
  general_note?: string | null
  exam_ready?: boolean
}

type PhotoRow = {
  id: string
  record_id: string
  url: string
  caption: string | null
  sort_order: number
  created_at: string
}

type Row = {
  id: string
  child_id: string
  recorded_at: string
  recorded_by: string | null
  height_cm: number | null
  weight_kg: number | null
  split_cm: number | null
  forward_reach_cm: number | null
  jump_cm: number | null
  technique_notes: string | null
  general_note: string | null
  exam_ready: boolean
  created_at: string
  updated_at: string
  profiles?:
    | { full_name: string }
    | { full_name: string }[]
    | null
  performance_photos?: PhotoRow[] | null
}

function mapPhoto(row: PhotoRow): PerformancePhoto {
  return {
    id: row.id,
    record_id: row.record_id,
    url: row.url,
    caption: row.caption,
    sort_order: row.sort_order,
    created_at: row.created_at,
  }
}

function mapRow(row: Row): PerformanceRecord {
  const recorder = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
  const photos = (row.performance_photos ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapPhoto)
  return {
    id: row.id,
    child_id: row.child_id,
    recorded_at: row.recorded_at,
    recorded_by: row.recorded_by,
    recorded_by_name: recorder?.full_name ?? null,
    height_cm: row.height_cm !== null ? Number(row.height_cm) : null,
    weight_kg: row.weight_kg !== null ? Number(row.weight_kg) : null,
    split_cm: row.split_cm !== null ? Number(row.split_cm) : null,
    forward_reach_cm:
      row.forward_reach_cm !== null ? Number(row.forward_reach_cm) : null,
    jump_cm: row.jump_cm !== null ? Number(row.jump_cm) : null,
    technique_notes: row.technique_notes,
    general_note: row.general_note,
    exam_ready: row.exam_ready,
    photos,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

const SELECT_WITH_RELATIONS = `
  *,
  profiles:recorded_by (
    full_name
  ),
  performance_photos (
    id,
    record_id,
    url,
    caption,
    sort_order,
    created_at
  )
`

/** List all performance records for a child, newest first. */
export async function listRecordsForChild(
  childId: string,
): Promise<PerformanceRecord[]> {
  const { data, error } = await supabase
    .from('performance_records')
    .select(SELECT_WITH_RELATIONS)
    .eq('child_id', childId)
    .order('recorded_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return (data as Row[]).map(mapRow)
}

export async function createRecord(
  input: PerformanceRecordInput,
): Promise<{ record: PerformanceRecord | null; error: string | null }> {
  const { data, error } = await supabase
    .from('performance_records')
    .insert({
      child_id: input.child_id,
      recorded_at: input.recorded_at ?? new Date().toISOString().slice(0, 10),
      recorded_by: input.recorded_by ?? null,
      height_cm: input.height_cm ?? null,
      weight_kg: input.weight_kg ?? null,
      split_cm: input.split_cm ?? null,
      forward_reach_cm: input.forward_reach_cm ?? null,
      jump_cm: input.jump_cm ?? null,
      technique_notes: input.technique_notes ?? null,
      general_note: input.general_note ?? null,
      exam_ready: input.exam_ready ?? false,
    })
    .select(SELECT_WITH_RELATIONS)
    .single()

  if (error || !data) {
    return { record: null, error: error?.message ?? 'Oluşturma başarısız.' }
  }
  return { record: mapRow(data as Row), error: null }
}

export async function updateRecord(
  id: string,
  input: Partial<PerformanceRecordInput>,
): Promise<{ record: PerformanceRecord | null; error: string | null }> {
  const { data, error } = await supabase
    .from('performance_records')
    .update({
      ...(input.recorded_at !== undefined && { recorded_at: input.recorded_at }),
      ...(input.height_cm !== undefined && { height_cm: input.height_cm }),
      ...(input.weight_kg !== undefined && { weight_kg: input.weight_kg }),
      ...(input.split_cm !== undefined && { split_cm: input.split_cm }),
      ...(input.forward_reach_cm !== undefined && {
        forward_reach_cm: input.forward_reach_cm,
      }),
      ...(input.jump_cm !== undefined && { jump_cm: input.jump_cm }),
      ...(input.technique_notes !== undefined && {
        technique_notes: input.technique_notes,
      }),
      ...(input.general_note !== undefined && { general_note: input.general_note }),
      ...(input.exam_ready !== undefined && { exam_ready: input.exam_ready }),
    })
    .eq('id', id)
    .select(SELECT_WITH_RELATIONS)
    .single()

  if (error || !data) {
    return { record: null, error: error?.message ?? 'Güncelleme başarısız.' }
  }
  return { record: mapRow(data as Row), error: null }
}

export async function deleteRecord(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('performance_records')
    .delete()
    .eq('id', id)
  return { error: error?.message ?? null }
}

// ─── Photos ─────────────────────────────────────────────────────────────────

export interface PhotoInput {
  url: string
  caption?: string | null
  sort_order?: number
}

/** Insert a batch of photos for a record. */
export async function insertPhotos(
  recordId: string,
  photos: PhotoInput[],
): Promise<{ photos: PerformancePhoto[]; error: string | null }> {
  if (photos.length === 0) return { photos: [], error: null }
  const { data, error } = await supabase
    .from('performance_photos')
    .insert(
      photos.map((p, i) => ({
        record_id: recordId,
        url: p.url,
        caption: p.caption ?? null,
        sort_order: p.sort_order ?? i,
      })),
    )
    .select('*')

  if (error || !data) {
    return { photos: [], error: error?.message ?? 'Foto eklenemedi.' }
  }
  return { photos: (data as PhotoRow[]).map(mapPhoto), error: null }
}

export async function updatePhoto(
  id: string,
  patch: { caption?: string | null; sort_order?: number },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('performance_photos')
    .update({
      ...(patch.caption !== undefined && { caption: patch.caption }),
      ...(patch.sort_order !== undefined && { sort_order: patch.sort_order }),
    })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function deletePhoto(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('performance_photos')
    .delete()
    .eq('id', id)
  return { error: error?.message ?? null }
}

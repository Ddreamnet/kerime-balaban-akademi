/**
 * Classes service — CRUD for the classes table.
 */

import { supabase } from './supabase'
import type { ClassGroup, BeltLevel, TrainingDay } from '@/types/content.types'

export interface ClassInput {
  name: string
  description: string
  age_range: string
  belt_levels: BeltLevel[]
  days: TrainingDay[]
  time_start: string
  time_end: string
  capacity: number
  instructor: string
  is_active?: boolean
  sort_order?: number
}

function mapClass(row: {
  id: string
  name: string
  description: string
  age_range: string
  belt_levels: string[]
  days: string[]
  time_start: string
  time_end: string
  capacity: number
  instructor: string
  is_active: boolean
}): ClassGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    age_range: row.age_range,
    belt_levels: row.belt_levels as BeltLevel[],
    days: row.days as TrainingDay[],
    time_start: row.time_start,
    time_end: row.time_end,
    capacity: row.capacity,
    instructor: row.instructor,
    is_active: row.is_active,
  }
}

/** Public: only active class groups */
export async function listActiveClasses(): Promise<ClassGroup[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data.map(mapClass)
}

/** Admin: all classes including inactive */
export async function listAllClasses(): Promise<ClassGroup[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data.map(mapClass)
}

export async function getClassById(id: string): Promise<ClassGroup | null> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return mapClass(data)
}

export async function createClass(
  input: ClassInput,
): Promise<{ classGroup: ClassGroup | null; error: string | null }> {
  const { data, error } = await supabase
    .from('classes')
    .insert({
      name: input.name,
      description: input.description,
      age_range: input.age_range,
      belt_levels: input.belt_levels,
      days: input.days,
      time_start: input.time_start,
      time_end: input.time_end,
      capacity: input.capacity,
      instructor: input.instructor,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single()

  if (error || !data) return { classGroup: null, error: error?.message ?? 'Oluşturma başarısız.' }
  return { classGroup: mapClass(data), error: null }
}

export async function updateClass(
  id: string,
  input: Partial<ClassInput>,
): Promise<{ classGroup: ClassGroup | null; error: string | null }> {
  const { data, error } = await supabase
    .from('classes')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.age_range !== undefined && { age_range: input.age_range }),
      ...(input.belt_levels !== undefined && { belt_levels: input.belt_levels }),
      ...(input.days !== undefined && { days: input.days }),
      ...(input.time_start !== undefined && { time_start: input.time_start }),
      ...(input.time_end !== undefined && { time_end: input.time_end }),
      ...(input.capacity !== undefined && { capacity: input.capacity }),
      ...(input.instructor !== undefined && { instructor: input.instructor }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { classGroup: null, error: error?.message ?? 'Güncelleme başarısız.' }
  return { classGroup: mapClass(data), error: null }
}

export async function deleteClass(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('classes').delete().eq('id', id)
  return { error: error?.message ?? null }
}

/** Count children enrolled in a specific class (helps admin understand capacity) */
export async function getChildrenCountByClass(classId: string): Promise<number> {
  const { count, error } = await supabase
    .from('children')
    .select('id', { count: 'exact', head: true })
    .eq('class_group_id', classId)

  if (error || count === null) return 0
  return count
}

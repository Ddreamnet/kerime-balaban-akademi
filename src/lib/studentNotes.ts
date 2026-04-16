/**
 * Student notes service — coach observations, performance, behavior notes.
 * Table not yet in generated DB types — uses explicit casts until next `supabase gen types`.
 */

import { supabase } from './supabase'

export type NoteCategory = 'genel' | 'performans' | 'davranis' | 'gelisim'

export interface StudentNote {
  id: string
  child_id: string
  coach_id: string
  category: NoteCategory
  title: string
  body: string | null
  rating: number | null
  note_date: string
  created_at: string
  updated_at: string
}

export interface StudentNoteInput {
  child_id: string
  category: NoteCategory
  title: string
  body?: string | null
  rating?: number | null
  note_date?: string
}

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
  genel: 'Genel',
  performans: 'Performans',
  davranis: 'Davranış',
  gelisim: 'Gelişim',
}

export const NOTE_CATEGORY_COLORS: Record<NoteCategory, string> = {
  genel: 'bg-blue-50 text-blue-700',
  performans: 'bg-green-50 text-green-700',
  davranis: 'bg-yellow-50 text-yellow-700',
  gelisim: 'bg-purple-50 text-purple-700',
}

type NoteRow = {
  id: string
  child_id: string
  coach_id: string
  category: string
  title: string
  body: string | null
  rating: number | null
  note_date: string
  created_at: string
  updated_at: string
}

function mapNote(row: NoteRow): StudentNote {
  return {
    id: row.id,
    child_id: row.child_id,
    coach_id: row.coach_id,
    category: row.category as NoteCategory,
    title: row.title,
    body: row.body,
    rating: row.rating,
    note_date: row.note_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = () => supabase.from('student_notes' as any)

/** List notes for a specific child */
export async function getNotesForChild(
  childId: string,
  limit = 50,
): Promise<StudentNote[]> {
  const { data, error } = await table()
    .select('*')
    .eq('child_id', childId)
    .order('note_date', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return (data as unknown as NoteRow[]).map(mapNote)
}

/** List all recent notes (coach overview) */
export async function getRecentNotes(
  limit = 50,
  category?: NoteCategory | null,
): Promise<StudentNote[]> {
  let query = table()
    .select('*')
    .order('note_date', { ascending: false })
    .limit(limit)

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error || !data) return []
  return (data as unknown as NoteRow[]).map(mapNote)
}

/** Create a new note */
export async function createNote(
  coachId: string,
  input: StudentNoteInput,
): Promise<{ note: StudentNote | null; error: string | null }> {
  const { data, error } = await table()
    .insert({
      child_id: input.child_id,
      coach_id: coachId,
      category: input.category,
      title: input.title,
      body: input.body ?? null,
      rating: input.rating ?? null,
      note_date: input.note_date ?? new Date().toISOString().split('T')[0],
    })
    .select('*')
    .single()

  if (error || !data) return { note: null, error: error?.message ?? 'Not oluşturulamadı.' }
  return { note: mapNote(data as unknown as NoteRow), error: null }
}

/** Update an existing note */
export async function updateNote(
  noteId: string,
  input: Partial<StudentNoteInput>,
): Promise<{ note: StudentNote | null; error: string | null }> {
  const { data, error } = await table()
    .update({
      ...(input.category !== undefined && { category: input.category }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.rating !== undefined && { rating: input.rating }),
      ...(input.note_date !== undefined && { note_date: input.note_date }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select('*')
    .single()

  if (error || !data) return { note: null, error: error?.message ?? 'Güncelleme başarısız.' }
  return { note: mapNote(data as unknown as NoteRow), error: null }
}

/** Delete a note */
export async function deleteNote(noteId: string): Promise<{ error: string | null }> {
  const { error } = await table().delete().eq('id', noteId)
  return { error: error?.message ?? null }
}

/**
 * Exams service — belt exams scheduled by admin and scored by coach.
 */

import { supabase } from './supabase'
import type { BeltLevel } from '@/types/content.types'

export interface Exam {
  id: string
  title: string
  exam_date: string
  location: string | null
  description: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
}

export interface ExamInput {
  title: string
  exam_date: string
  location?: string | null
  description?: string | null
  is_published?: boolean
}

export interface ExamResult {
  id: string
  exam_id: string
  child_id: string
  passed: boolean | null
  new_belt: BeltLevel | null
  technical_score: number | null
  attitude_score: number | null
  notes: string | null
  scored_by: string | null
  scored_at: string | null
  created_at: string
}

export interface ExamResultWithChild extends ExamResult {
  child_full_name: string
  child_avatar_url: string | null
  child_belt_level: BeltLevel | null
}

export interface ExamWithChild extends Exam {
  result?: ExamResult | null
}

function mapExam(row: {
  id: string
  title: string
  exam_date: string
  location: string | null
  description: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
}): Exam {
  return {
    id: row.id,
    title: row.title,
    exam_date: row.exam_date,
    location: row.location,
    description: row.description,
    is_published: row.is_published,
    created_by: row.created_by,
    created_at: row.created_at,
  }
}

function mapResult(row: {
  id: string
  exam_id: string
  child_id: string
  passed: boolean | null
  new_belt: string | null
  technical_score: number | null
  attitude_score: number | null
  notes: string | null
  scored_by: string | null
  scored_at: string | null
  created_at: string
}): ExamResult {
  return {
    id: row.id,
    exam_id: row.exam_id,
    child_id: row.child_id,
    passed: row.passed,
    new_belt: (row.new_belt as BeltLevel | null) ?? null,
    technical_score: row.technical_score,
    attitude_score: row.attitude_score,
    notes: row.notes,
    scored_by: row.scored_by,
    scored_at: row.scored_at,
    created_at: row.created_at,
  }
}

// ─── Exams CRUD (admin) ─────────────────────────────────────────────────────

export async function listExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('exam_date', { ascending: false })

  if (error || !data) return []
  return data.map(mapExam)
}

export async function listPublishedExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('is_published', true)
    .order('exam_date', { ascending: false })

  if (error || !data) return []
  return data.map(mapExam)
}

export async function getExam(id: string): Promise<Exam | null> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return mapExam(data)
}

export async function createExam(
  input: ExamInput,
  createdBy: string | null,
): Promise<{ exam: Exam | null; error: string | null }> {
  const { data, error } = await supabase
    .from('exams')
    .insert({
      title: input.title,
      exam_date: input.exam_date,
      location: input.location ?? null,
      description: input.description ?? null,
      is_published: input.is_published ?? true,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error || !data) return { exam: null, error: error?.message ?? 'Oluşturma başarısız.' }
  return { exam: mapExam(data), error: null }
}

export async function updateExam(
  id: string,
  input: Partial<ExamInput>,
): Promise<{ exam: Exam | null; error: string | null }> {
  const { data, error } = await supabase
    .from('exams')
    .update(input)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { exam: null, error: error?.message ?? 'Güncelleme başarısız.' }
  return { exam: mapExam(data), error: null }
}

export async function deleteExam(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('exams').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ─── Exam enrollment (admin) ────────────────────────────────────────────────

export async function enrollChild(
  examId: string,
  childId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('exam_results')
    .upsert({ exam_id: examId, child_id: childId }, { onConflict: 'exam_id,child_id' })
  return { error: error?.message ?? null }
}

export async function unenrollChild(
  examId: string,
  childId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('exam_results')
    .delete()
    .eq('exam_id', examId)
    .eq('child_id', childId)
  return { error: error?.message ?? null }
}

// ─── Scoring (coach) ────────────────────────────────────────────────────────

export interface ScoreInput {
  passed: boolean | null
  new_belt?: BeltLevel | null
  technical_score?: number | null
  attitude_score?: number | null
  notes?: string | null
}

export async function scoreResult(
  resultId: string,
  input: ScoreInput,
  scoredBy: string | null,
): Promise<{ result: ExamResult | null; error: string | null }> {
  const { data, error } = await supabase
    .from('exam_results')
    .update({
      passed: input.passed,
      new_belt: input.new_belt ?? null,
      technical_score: input.technical_score ?? null,
      attitude_score: input.attitude_score ?? null,
      notes: input.notes ?? null,
      scored_by: scoredBy,
      scored_at: input.passed !== null ? new Date().toISOString() : null,
    })
    .eq('id', resultId)
    .select('*')
    .single()

  if (error || !data) return { result: null, error: error?.message ?? 'Kayıt başarısız.' }
  return { result: mapResult(data), error: null }
}

// ─── List results ───────────────────────────────────────────────────────────

/** Admin/Coach: all results for a specific exam with child details */
export async function listResultsForExam(examId: string): Promise<ExamResultWithChild[]> {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      *,
      children!exam_results_child_id_fkey (
        full_name,
        avatar_url,
        belt_level
      )
    `)
    .eq('exam_id', examId)

  if (error || !data) return []

  return data.map((row) => {
    type ChildJoin = { full_name: string; avatar_url: string | null; belt_level: string | null }
    const child = (Array.isArray(row.children) ? row.children[0] : row.children) as ChildJoin | null
    return {
      ...mapResult(row),
      child_full_name: child?.full_name ?? '',
      child_avatar_url: child?.avatar_url ?? null,
      child_belt_level: (child?.belt_level as BeltLevel | null) ?? null,
    }
  })
}

/** Parent: all exams with their child's result */
export async function getChildExamHistory(childId: string): Promise<ExamWithChild[]> {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      *,
      exams!exam_results_exam_id_fkey (*)
    `)
    .eq('child_id', childId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  type ExamJoin = {
    id: string
    title: string
    exam_date: string
    location: string | null
    description: string | null
    is_published: boolean
    created_by: string | null
    created_at: string
  }

  return data
    .map((row) => {
      const exam = (Array.isArray(row.exams) ? row.exams[0] : row.exams) as ExamJoin | null
      if (!exam) return null
      return {
        ...mapExam(exam),
        result: mapResult(row),
      } as ExamWithChild
    })
    .filter((x): x is ExamWithChild => x !== null)
}

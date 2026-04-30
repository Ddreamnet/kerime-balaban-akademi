/**
 * Class-coaches m2m service.
 *
 * Bir koç'un atandığı SPESİFİK class'ları yönetir. coach_branches branş
 * seviyesi izin (admin UI'da hint), class_coaches ise gerçek scope kaynağıdır.
 *
 * Coach UI scope tüm yerlerde class_coaches'tan çekilir:
 * - CoachAttendancePage: sadece atanmış class'ların yoklamasını alır
 * - CoachStudentsPage: sadece atanmış class'lardaki öğrencileri görür
 * - CoachStudentDetailPage: sadece kendi öğrencilerinin profilini düzenler
 * - CoachDashboard: sadece atanmış class'ların istatistikleri
 */

import { supabase } from './supabase'

export interface ClassCoachAssignment {
  class_id: string
  coach_id: string
  assigned_at: string
  assigned_by: string | null
}

/** Bir koç'un atandığı tüm class ID'leri */
export async function listClassIdsForCoach(coachId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('class_coaches')
    .select('class_id')
    .eq('coach_id', coachId)

  if (error || !data) return []
  return data.map((r: { class_id: string }) => r.class_id)
}

/** Bir class'a atanmış tüm koç ID'leri */
export async function listCoachIdsForClass(classId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('class_coaches')
    .select('coach_id')
    .eq('class_id', classId)

  if (error || !data) return []
  return data.map((r: { coach_id: string }) => r.coach_id)
}

/**
 * Birden fazla class için koç ID'lerini topluca çek.
 * Admin UI'da listeleme/badge'ler için kullanışlı.
 */
export async function listCoachIdsByClassMap(
  classIds: string[],
): Promise<Map<string, string[]>> {
  if (classIds.length === 0) return new Map()
  const { data, error } = await supabase
    .from('class_coaches')
    .select('class_id, coach_id')
    .in('class_id', classIds)

  if (error || !data) return new Map()
  const map = new Map<string, string[]>()
  for (const row of data as { class_id: string; coach_id: string }[]) {
    const cur = map.get(row.class_id) ?? []
    cur.push(row.coach_id)
    map.set(row.class_id, cur)
  }
  return map
}

/** Admin: bir class'a koç ata */
export async function assignCoachToClass(
  classId: string,
  coachId: string,
  assignedBy: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('class_coaches')
    .insert({
      class_id: classId,
      coach_id: coachId,
      assigned_by: assignedBy,
    })

  if (error && error.code === '23505') {
    return { error: null } // zaten atanmış, idempotent
  }
  return { error: error?.message ?? null }
}

/** Admin: bir class'tan koçu kaldır */
export async function removeCoachFromClass(
  classId: string,
  coachId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('class_coaches')
    .delete()
    .eq('class_id', classId)
    .eq('coach_id', coachId)

  return { error: error?.message ?? null }
}

/**
 * Admin: bir class'ın koç atamalarını topluca güncelle.
 * Mevcut atamaları sil, yenilerini ekle (diff-based — minimum operasyon).
 */
export async function syncClassCoaches(
  classId: string,
  desiredCoachIds: string[],
  assignedBy: string,
): Promise<{ error: string | null }> {
  const { data: current, error: fetchError } = await supabase
    .from('class_coaches')
    .select('coach_id')
    .eq('class_id', classId)

  if (fetchError) return { error: fetchError.message }

  const currentIds = new Set((current ?? []).map((r: { coach_id: string }) => r.coach_id))
  const desiredIds = new Set(desiredCoachIds)

  const toAdd = desiredCoachIds.filter((id) => !currentIds.has(id))
  const toRemove = [...currentIds].filter((id) => !desiredIds.has(id))

  if (toAdd.length > 0) {
    const { error: insertError } = await supabase
      .from('class_coaches')
      .insert(toAdd.map((coach_id) => ({ class_id: classId, coach_id, assigned_by: assignedBy })))
    if (insertError) return { error: insertError.message }
  }

  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('class_coaches')
      .delete()
      .eq('class_id', classId)
      .in('coach_id', toRemove)
    if (deleteError) return { error: deleteError.message }
  }

  return { error: null }
}

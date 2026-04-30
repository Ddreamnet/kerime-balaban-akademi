/**
 * Lessons service — paket sisteminin önceden planlanmış ders kayıtları.
 *
 * Lesson satırları DB trigger'da otomatik oluşur (paket oluşurken
 * generate_package_lessons çağrılır). Bu lib sadece okuma + class-level
 * cancel RPC wrapper'ını sağlar.
 *
 * Status: scheduled / completed / excused / cancelled.
 */

import { supabase } from './supabase'
import { todayIsoTrt } from '@/utils/format'

export type LessonStatus = 'scheduled' | 'completed' | 'excused' | 'cancelled'

export interface Lesson {
  id: string
  package_id: string | null
  class_id: string
  child_id: string
  scheduled_date: string
  scheduled_time: string | null
  lesson_index: number
  is_telafi: boolean
  is_extra: boolean
  status: LessonStatus
  created_at: string
  updated_at: string
}

function mapLesson(row: {
  id: string
  package_id: string | null
  class_id: string
  child_id: string
  scheduled_date: string
  scheduled_time: string | null
  lesson_index: number
  is_telafi: boolean
  is_extra: boolean
  status: string
  created_at: string
  updated_at: string
}): Lesson {
  return {
    id: row.id,
    package_id: row.package_id,
    class_id: row.class_id,
    child_id: row.child_id,
    scheduled_date: row.scheduled_date,
    scheduled_time: row.scheduled_time,
    lesson_index: row.lesson_index,
    is_telafi: row.is_telafi,
    is_extra: row.is_extra,
    status: row.status as LessonStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/** Bir paketin tüm lesson'ları (sıralı) */
export async function listLessonsByPackage(packageId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('package_id', packageId)
    .order('lesson_index', { ascending: true })

  if (error || !data) return []
  return data.map(mapLesson)
}

/** Bir sınıfta belirli tarihteki tüm lesson'lar (yoklama UI için) */
export async function listLessonsByClassDate(
  classId: string,
  date: string,
): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('class_id', classId)
    .eq('scheduled_date', date)

  if (error || !data) return []
  return data.map(mapLesson)
}

/** Bir çocuğun yaklaşan lesson'ları (parent UI için) */
export async function listUpcomingLessons(
  childId: string,
  limit = 5,
): Promise<Lesson[]> {
  const today = todayIsoTrt()
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('child_id', childId)
    .gte('scheduled_date', today)
    .eq('status', 'scheduled')
    .order('scheduled_date', { ascending: true })
    .limit(limit)

  if (error || !data) return []
  return data.map(mapLesson)
}

/**
 * Belirli bir tarihte child için scheduled lesson var mı? (Yoklama UI'da
 * "🆕 Yeni paket" badge'i göstermek için: aktif paket varsa true, yoksa false →
 * implicit consent path).
 */
export async function getScheduledLessonForChildOnDate(
  childId: string,
  date: string,
): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('child_id', childId)
    .eq('scheduled_date', date)
    .eq('status', 'scheduled')
    .order('lesson_index', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return mapLesson(data)
}

/**
 * Class-level cancel RPC wrapper.
 * SECURITY DEFINER fonksiyon admin/coach yetkisi kontrol eder.
 * Veliler için 'lesson_cancelled' bildirimi otomatik atılır.
 */
export async function cancelClassLesson(
  classId: string,
  date: string,
): Promise<{ count: number; error: string | null }> {
  const { data, error } = await supabase.rpc('cancel_class_lesson', {
    p_class_id: classId,
    p_date: date,
  })

  if (error) return { count: 0, error: error.message }
  return { count: (data as number | null) ?? 0, error: null }
}

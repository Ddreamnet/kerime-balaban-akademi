/**
 * Attendance service — tracks child attendance per class per date.
 */

import { supabase } from './supabase'

export type AttendanceStatus = 'present' | 'absent' | 'excused'

export interface AttendanceRecord {
  id: string
  child_id: string
  class_id: string | null
  /**
   * Paket sistemindeki attendance kayıtları bir lesson satırına bağlanır.
   * Taekwondo (monthly) için NULL kalır — DB trigger billing_model'e göre
   * BEFORE INSERT'te resolve eder ya da bırakır.
   */
  lesson_id: string | null
  date: string
  status: AttendanceStatus
  marked_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Geldi',
  absent: 'Gelmedi',
  excused: 'Mazeretli',
}

function mapAttendance(row: {
  id: string
  child_id: string
  class_id: string | null
  lesson_id?: string | null
  date: string
  status: string
  marked_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}): AttendanceRecord {
  return {
    id: row.id,
    child_id: row.child_id,
    class_id: row.class_id,
    lesson_id: row.lesson_id ?? null,
    date: row.date,
    status: row.status as AttendanceStatus,
    marked_by: row.marked_by,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/** Coach: fetch all attendance rows for a given class + date */
export async function getAttendanceForClassDate(
  classId: string,
  date: string,
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', classId)
    .eq('date', date)

  if (error || !data) return []
  return data.map(mapAttendance)
}

/** Upsert a single attendance record (coach action) */
export async function upsertAttendance(
  childId: string,
  classId: string,
  date: string,
  status: AttendanceStatus,
  markedBy: string,
): Promise<{ record: AttendanceRecord | null; error: string | null }> {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(
      {
        child_id: childId,
        class_id: classId,
        date,
        status,
        marked_by: markedBy,
      },
      { onConflict: 'child_id,date,class_id' },
    )
    .select('*')
    .single()

  if (error || !data) return { record: null, error: error?.message ?? 'Kayıt başarısız.' }
  return { record: mapAttendance(data), error: null }
}

/** Parent: fetch attendance history for a specific child */
export async function getChildAttendance(
  childId: string,
  limit = 90,
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('child_id', childId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data.map(mapAttendance)
}

export interface AttendanceStats {
  total: number
  present: number
  absent: number
  excused: number
  presentRate: number
}

export function computeStats(records: AttendanceRecord[]): AttendanceStats {
  const total = records.length
  const present = records.filter((r) => r.status === 'present').length
  const absent = records.filter((r) => r.status === 'absent').length
  const excused = records.filter((r) => r.status === 'excused').length
  const presentRate = total > 0 ? Math.round((present / total) * 100) : 0
  return { total, present, absent, excused, presentRate }
}

/** Admin: fetch all attendance records within a date range, optionally filtered by class */
export async function getAttendanceByRange(
  startDate: string,
  endDate: string,
  classId?: string | null,
): Promise<AttendanceRecord[]> {
  let query = supabase
    .from('attendance')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (classId) query = query.eq('class_id', classId)

  const { data, error } = await query
  if (error || !data) return []
  return data.map(mapAttendance)
}

/** Admin: get distinct dates that have attendance records */
export async function getAttendanceDates(
  classId?: string | null,
  limit = 30,
): Promise<string[]> {
  let query = supabase
    .from('attendance')
    .select('date')
    .order('date', { ascending: false })
    .limit(limit * 10) // overfetch to deduplicate

  if (classId) query = query.eq('class_id', classId)

  const { data, error } = await query
  if (error || !data) return []

  const unique = [...new Set(data.map((r: { date: string }) => r.date))]
  return unique.slice(0, limit)
}

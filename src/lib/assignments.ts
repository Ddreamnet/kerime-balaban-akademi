/**
 * Child-coach assignments (many-to-many).
 *
 * RLS:
 *   - Parent reads own child's assignments.
 *   - Coach reads own assignments.
 *   - Admin full access (assign/unassign).
 */

import { supabase } from './supabase'
import type { UserProfile, UserRole } from '@/types/auth.types'

export interface AssignedCoach {
  coach_id: string
  full_name: string
  email: string
  avatar_url: string | null
  assigned_at: string
}

type CoachJoinRow = {
  coach_id: string
  assigned_at: string
  profiles: {
    full_name: string
    email: string
    avatar_url: string | null
  } | null
}

function mapAssignedCoach(row: CoachJoinRow): AssignedCoach {
  return {
    coach_id: row.coach_id,
    full_name: row.profiles?.full_name ?? '',
    email: row.profiles?.email ?? '',
    avatar_url: row.profiles?.avatar_url ?? null,
    assigned_at: row.assigned_at,
  }
}

export async function listCoachesForChild(childId: string): Promise<AssignedCoach[]> {
  const { data, error } = await supabase
    .from('child_coaches')
    .select(`
      coach_id,
      assigned_at,
      profiles:coach_id (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('child_id', childId)
    .order('assigned_at', { ascending: true })

  if (error || !data) return []
  return (data as unknown as CoachJoinRow[]).map(mapAssignedCoach)
}

export async function assignCoach(
  childId: string,
  coachId: string,
  assignedBy: string | null,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('child_coaches').insert({
    child_id: childId,
    coach_id: coachId,
    assigned_by: assignedBy,
  })
  return { error: error?.message ?? null }
}

export async function unassignCoach(
  childId: string,
  coachId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('child_coaches')
    .delete()
    .eq('child_id', childId)
    .eq('coach_id', coachId)
  return { error: error?.message ?? null }
}

/** Child IDs assigned to a given coach. */
export async function listChildIdsForCoach(coachId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('child_coaches')
    .select('child_id')
    .eq('coach_id', coachId)

  if (error || !data) return new Set()
  return new Set(data.map((r) => r.child_id))
}

/** Children ids that currently have no coach assigned. */
export async function listUnassignedChildIds(): Promise<Set<string>> {
  const [{ data: allChildren }, { data: assigned }] = await Promise.all([
    supabase.from('children').select('id'),
    supabase.from('child_coaches').select('child_id'),
  ])
  const all = new Set((allChildren ?? []).map((r) => r.id))
  for (const r of assigned ?? []) {
    all.delete(r.child_id)
  }
  return all
}

/**
 * Convenience: fetch all coaches (approved + active) for pickers.
 * Uses the existing profiles table. Shape matches UserProfile with role='coach'.
 */
export async function listAssignableCoaches(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'coach')
    .eq('approval_status', 'approved')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  if (error || !data) return []
  return data.map((row) => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone ?? undefined,
    avatar_url: row.avatar_url ?? undefined,
    role: row.role as UserRole,
    approval_status: row.approval_status as UserProfile['approval_status'],
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

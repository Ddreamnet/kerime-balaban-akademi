/**
 * Auth service — all Supabase auth calls live here.
 * Pages import from this file, never call supabase.auth.* directly.
 */

import { supabase } from './supabase'
import type {
  UserProfile,
  UserRole,
  SignupRole,
  ApprovalStatus,
} from '@/types/auth.types'
import { isFullyActive } from '@/types/auth.types'

// ─── Sign in ─────────────────────────────────────────────────────────────────

export type SignInStatus =
  | { kind: 'ok'; profile: UserProfile }
  | { kind: 'pending'; profile: UserProfile }
  | { kind: 'rejected'; profile: UserProfile }
  | { kind: 'inactive'; profile: UserProfile }
  | { kind: 'error'; message: string }

export async function signIn(email: string, password: string): Promise<SignInStatus> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { kind: 'error', message: mapAuthError(error.message) }
  if (!data.user) return { kind: 'error', message: 'Giriş başarısız.' }

  const profile = await fetchProfile(data.user.id)
  if (!profile) {
    await supabase.auth.signOut()
    return { kind: 'error', message: 'Kullanıcı profili bulunamadı.' }
  }

  // Gate 1: pending approval
  if (profile.approval_status === 'pending') {
    // Keep session alive? No — pending users should not have active session.
    await supabase.auth.signOut()
    return { kind: 'pending', profile }
  }

  // Gate 2: rejected
  if (profile.approval_status === 'rejected') {
    await supabase.auth.signOut()
    return { kind: 'rejected', profile }
  }

  // Gate 3: deactivated
  if (!profile.is_active) {
    await supabase.auth.signOut()
    return { kind: 'inactive', profile }
  }

  return { kind: 'ok', profile }
}

// ─── Sign up ─────────────────────────────────────────────────────────────────

export interface SignUpResult {
  error: string | null
  needsEmailConfirmation: boolean
}

/**
 * Register a new user with the selected role (parent | coach).
 * Accounts are created with approval_status='pending' and is_active=false
 * via the database trigger. Admin must approve before login is possible.
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: SignupRole,
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  })

  if (error) return { error: mapAuthError(error.message), needsEmailConfirmation: false }
  if (!data.user) return { error: 'Kayıt başarısız.', needsEmailConfirmation: false }

  // Phone is stored on profiles (not in auth metadata). Update after insert.
  // Trigger has already created the profiles row via handle_new_user().
  await supabase
    .from('profiles')
    .update({ phone })
    .eq('id', data.user.id)

  // Always sign out — user must be approved first.
  // This makes the flow consistent whether email confirmation is on or off.
  await supabase.auth.signOut()

  const needsEmailConfirmation = !data.session
  return { error: null, needsEmailConfirmation }
}

// ─── Sign out ────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

// ─── Fetch profile ────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return mapProfile(data)
}

function mapProfile(row: {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: string
  approval_status: string
  is_active: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}): UserProfile {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone ?? undefined,
    role: row.role as UserRole,
    approval_status: row.approval_status as ApprovalStatus,
    is_active: row.is_active,
    avatar_url: row.avatar_url ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// ─── Admin: approval actions ─────────────────────────────────────────────────

export async function approveUser(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ approval_status: 'approved', is_active: true })
    .eq('id', userId)

  if (error) return { error: error.message }

  // Also confirm the user's email in auth.users so Supabase allows login.
  // Admin approval is our real trust gate — email confirmation is redundant.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: rpcError } = await supabase.rpc('confirm_user_email' as any, { user_id: userId })
  if (rpcError) return { error: rpcError.message }

  return { error: null }
}

export async function rejectUser(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ approval_status: 'rejected', is_active: false })
    .eq('id', userId)
  return { error: error?.message ?? null }
}

export async function deactivateUser(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId)
  return { error: error?.message ?? null }
}

export async function reactivateUser(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: true })
    .eq('id', userId)
  return { error: error?.message ?? null }
}

// ─── Profile editing ─────────────────────────────────────────────────────────

export interface ProfileUpdateInput {
  full_name?: string
  phone?: string | null
  avatar_url?: string | null
}

/**
 * Update the currently authenticated user's own profile.
 * Email and password changes are intentionally NOT supported here — those
 * require separate Supabase auth calls and a more careful confirmation flow.
 */
export async function updateOwnProfile(
  userId: string,
  input: ProfileUpdateInput,
): Promise<{ profile: UserProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: input.full_name,
      phone: input.phone,
      avatar_url: input.avatar_url,
    })
    .eq('id', userId)
    .select('*')
    .single()

  if (error || !data) return { profile: null, error: error?.message ?? 'Güncelleme başarısız.' }
  return { profile: mapProfile(data), error: null }
}

/**
 * Admin-only: edit another user's profile.
 * Enforced by RLS — only admins can UPDATE rows they don't own.
 * Email and password are NOT editable (Phase 4 rule #2).
 */
export async function adminUpdateProfile(
  userId: string,
  input: ProfileUpdateInput,
): Promise<{ profile: UserProfile | null; error: string | null }> {
  return updateOwnProfile(userId, input)
}

// ─── List profiles (admin only via RLS) ─────────────────────────────────────

export async function listProfiles(filters?: {
  role?: UserRole
  approval_status?: ApprovalStatus
}): Promise<UserProfile[]> {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (filters?.role) query = query.eq('role', filters.role)
  if (filters?.approval_status) query = query.eq('approval_status', filters.approval_status)

  const { data, error } = await query
  if (error || !data) return []
  return data.map(mapProfile)
}

// Re-export helper for component consumers
export { isFullyActive }

// ─── Error mapping ───────────────────────────────────────────────────────────

function mapAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'E-posta veya şifre hatalı.'
  }
  if (m.includes('already registered') || m.includes('user already')) {
    return 'Bu e-posta ile zaten bir hesap var.'
  }
  if (m.includes('email not confirmed')) {
    return 'E-posta adresiniz henüz onaylanmamış.'
  }
  if (m.includes('password') && m.includes('6')) {
    return 'Şifre en az 6 karakter olmalıdır.'
  }
  return message
}

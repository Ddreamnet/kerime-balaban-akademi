/**
 * Authentication and user types.
 * Mirror Supabase profiles table shape exactly.
 */

export type UserRole = 'admin' | 'coach' | 'parent'

/** Only 'parent' and 'coach' are selectable at registration time. */
export type SignupRole = Exclude<UserRole, 'admin'>

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  id: string              // matches Supabase auth.users.id (UUID)
  email: string
  full_name: string
  phone?: string
  role: UserRole
  approval_status: ApprovalStatus
  is_active: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

/** A profile is considered "usable" only when approved AND active. */
export function isFullyActive(profile: UserProfile | null): boolean {
  return !!profile && profile.approval_status === 'approved' && profile.is_active
}

// Role-based dashboard routes
export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: '/admin/panel',
  coach: '/antrenor/panel',
  parent: '/veli/panel',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Yönetici',
  coach: 'Antrenör',
  parent: 'Veli',
}

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Onay Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
}

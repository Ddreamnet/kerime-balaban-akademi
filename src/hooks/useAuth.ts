/**
 * Auth hook — reads from Zustand store.
 * When Supabase is connected, the store will be populated by
 * supabase.auth.onAuthStateChange in the Providers wrapper.
 */

import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/auth.types'

export function useAuth() {
  const { user, isLoading, setUser, setLoading, signOut } = useAuthStore()

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    role: user?.role ?? null,
    hasRole: (role: UserRole) => user?.role === role,
    signOut,
    setUser,
    setLoading,
  }
}

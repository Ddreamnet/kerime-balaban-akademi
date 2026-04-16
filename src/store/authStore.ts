import { create } from 'zustand'
import type { UserProfile } from '@/types/auth.types'

interface AuthStore {
  user: UserProfile | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true, // true until first auth check resolves

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null, isLoading: false }),
}))

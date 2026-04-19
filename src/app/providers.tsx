import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { supabase } from '@/lib/supabase'
import { fetchProfile } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import { isFullyActive } from '@/types/auth.types'
import { SiteSettingsProvider } from '@/hooks/useSiteSettings'
import { registerPushForUser } from '@/lib/notifications'

/**
 * Bootstraps the Supabase auth listener before rendering routes.
 *
 * Critical behavior:
 * - Sessions whose profiles are not "fully active" (pending/rejected/inactive)
 *   are immediately signed out. This prevents a stale session from granting
 *   dashboard access after an admin revokes approval.
 */
function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    setLoading(true)

    const resolveSession = async (userId: string) => {
      const profile = await fetchProfile(userId)
      if (profile && isFullyActive(profile)) {
        setUser(profile)
        // Register this device's push token in the background.
        void registerPushForUser(profile.id).catch(() => {
          // Silent — push is optional; never block login on it.
        })
      } else {
        // Stale or never-approved session — kill it.
        await supabase.auth.signOut()
        setUser(null)
      }
    }

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void resolveSession(session.user.id)
      } else {
        setUser(null)
      }
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          return
        }
        if (session.user) {
          void resolveSession(session.user.id)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  return <>{children}</>
}

export function Providers() {
  return (
    <SiteSettingsProvider>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
    </SiteSettingsProvider>
  )
}

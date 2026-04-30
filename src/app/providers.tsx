import { useEffect, useRef } from 'react'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Capacitor } from '@capacitor/core'
import { router } from './router'
import { supabase } from '@/lib/supabase'
import { fetchProfile } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import { isFullyActive, ROLE_DASHBOARD_ROUTES } from '@/types/auth.types'
import type { UserProfile } from '@/types/auth.types'
import { SiteSettingsProvider } from '@/hooks/useSiteSettings'
import { registerPushForUser, registerPushListeners } from '@/lib/notifications'
import { ErrorBoundary } from './ErrorBoundary'

/**
 * On a native cold-start, the WebView always reloads `index.html` so the
 * router starts at `/`. If we already have a persisted session, bounce the
 * user to their role's panel instead of stranding them on the public home
 * page. Runs once per process; later navigations (manual logo tap, etc.)
 * are unaffected.
 */
/**
 * Shallow equality on the fields we render, so a refetched profile that's
 * identical to what's already in the store doesn't trigger a Zustand update
 * (and the form-reset cascade that follows from it).
 */
function profilesEqual(a: UserProfile | null, b: UserProfile | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.id === b.id &&
    a.email === b.email &&
    a.full_name === b.full_name &&
    a.phone === b.phone &&
    a.role === b.role &&
    a.approval_status === b.approval_status &&
    a.is_active === b.is_active &&
    a.avatar_url === b.avatar_url &&
    a.updated_at === b.updated_at
  )
}

function maybeRedirectToPanelOnColdStart(profile: UserProfile): void {
  if (!Capacitor.isNativePlatform()) return

  const path = window.location.pathname
  // Dashboard paths: /admin/*, /antrenor/*, /veli/*. Don't hijack these —
  // the user may have opened a specific deep-link.
  const inDashboard = /^\/(admin|antrenor|veli)(\/|$)/.test(path)
  if (inDashboard) return

  const target = ROLE_DASHBOARD_ROUTES[profile.role]
  if (path === target) return

  void router.navigate(target, { replace: true })
}

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
  // Redirect to role panel only on the very first session resolution of
  // this app process — subsequent SIGNED_IN events (manual login) are
  // handled by the login flow itself.
  const coldStartRedirectDone = useRef(false)

  useEffect(() => {
    setLoading(true)

    // One-time push listener registration (foreground + tap).
    // Phase 1: foreground arrival is logged; tap is routed to link_url when
    // the payload carries one. Phase 2 will open a dialog from the tap.
    registerPushListeners({
      onForeground: () => {
        // foreground push — UI handler'lar tetiklenir; gizlilik için log atmıyoruz
      },
      onTap: (data) => {
        const link = typeof data.link_url === 'string' ? data.link_url : null
        if (link && link.startsWith('/')) {
          window.location.assign(link)
        }
      },
    })

    const resolveSession = async (userId: string, isInitial: boolean) => {
      const profile = await fetchProfile(userId)
      if (profile && isFullyActive(profile)) {
        // Supabase v2 fires redundant SIGNED_IN events on tab visibility
        // changes (e.g. when a file picker opens and closes). Skipping the
        // setUser call when nothing actually changed prevents any open form
        // bound to `user` via react-hook-form `values` from being reset
        // mid-edit — which would, for example, wipe a freshly-uploaded
        // avatar URL before the user clicks Save.
        const current = useAuthStore.getState().user
        if (!profilesEqual(current, profile)) {
          setUser(profile)
        }
        // Register this device's push token in the background.
        void registerPushForUser(profile.id).catch(() => {
          // Silent — push is optional; never block login on it.
        })
        if (isInitial && !coldStartRedirectDone.current) {
          coldStartRedirectDone.current = true
          maybeRedirectToPanelOnColdStart(profile)
        }
      } else {
        // Stale or never-approved session — kill it.
        await supabase.auth.signOut()
        setUser(null)
      }
    }

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void resolveSession(session.user.id, true)
      } else {
        coldStartRedirectDone.current = true
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
          void resolveSession(session.user.id, false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  return <>{children}</>
}

export function Providers() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <SiteSettingsProvider>
          <AuthBootstrap>
            <RouterProvider router={router} />
          </AuthBootstrap>
        </SiteSettingsProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

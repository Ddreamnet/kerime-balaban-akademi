import { cn } from '@/utils/cn'

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

/**
 * Top-level Capacitor-aware shell.
 *
 * Handles:
 * - viewport-fit=cover horizontal safe areas for iOS/Android
 * - Minimum height fill
 * - No horizontal overflow
 *
 * Top (status-bar) safe area is applied by the fixed headers that sit on top
 * of the app (Header.tsx, DashboardLayout mobile bar); applying it here too
 * would double-pad public pages.
 */
export function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        'min-h-dvh w-full overflow-x-hidden',
        'bg-surface text-on-surface',
        // Capacitor horizontal safe area — no-op on web
        'pl-safe pr-safe',
        className
      )}
    >
      {children}
    </div>
  )
}

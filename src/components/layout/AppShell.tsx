import { cn } from '@/utils/cn'

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

/**
 * Top-level Capacitor-aware shell.
 *
 * Handles:
 * - viewport-fit=cover safe areas for iOS notch/home bar
 * - Minimum height fill
 * - No horizontal overflow
 *
 * All pages are rendered inside this wrapper.
 */
export function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        'min-h-dvh w-full overflow-x-hidden',
        'bg-surface text-on-surface',
        // Capacitor safe area padding — no-op on web
        'pt-safe pl-safe pr-safe',
        className
      )}
    >
      {children}
    </div>
  )
}

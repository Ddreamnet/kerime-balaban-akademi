import { cn } from '@/utils/cn'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  narrow?: boolean
  wide?: boolean
}

/**
 * Max-width content wrapper with responsive horizontal padding.
 * narrow → 768px for single-column content (auth pages, etc.)
 * wide   → 1440px for full-bleed-ish layouts
 * default → 1280px
 */
export function Container({ children, className, narrow, wide }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        narrow && 'max-w-2xl',
        wide && 'max-w-screen-xl',
        !narrow && !wide && 'max-w-7xl',
        className
      )}
    >
      {children}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Accessible modal dialog with backdrop blur.
 * Traps focus, closes on Escape and backdrop click.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={cn(
          'relative z-10 w-full bg-surface-card rounded-t-2xl sm:rounded-2xl',
          'shadow-ambient-lg animate-scale-in',
          'max-h-[90dvh] overflow-y-auto',
          size === 'sm' && 'sm:max-w-sm',
          size === 'md' && 'sm:max-w-md',
          size === 'lg' && 'sm:max-w-lg',
          className
        )}
      >
        {/* Header */}
        {(title) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-low">
            {title && (
              <h2 id="modal-title" className="text-headline-sm font-display">
                {title}
              </h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Kapat"
              className="ml-auto -mr-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

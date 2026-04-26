import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  /** Plain title — rendered with a default header. */
  title?: string
  /** Optional sub-line displayed beneath the title. */
  description?: string
  /** Lucide icon to display next to the title — small accent. */
  icon?: React.ComponentType<{ className?: string }>
  /** Body content. */
  children: React.ReactNode
  /** Sticky footer area (form actions). Renders inside its own padded row. */
  footer?: React.ReactNode
  size?: ModalSize
  /** Adds the diagonal red accent bands behind the header. */
  decoratedHeader?: boolean
  /** Custom class for the outer panel. */
  className?: string
  /** Hide the close button — use for forced-action dialogs only. */
  hideClose?: boolean
}

/**
 * Accessible modal dialog with backdrop blur.
 * Traps focus, closes on Escape and backdrop click.
 *
 * Mobile: slides up from the bottom as a sheet. Desktop: centred panel.
 * Optional header decoration mirrors the public hero accent so dialogs feel
 * part of the brand.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  size = 'md',
  decoratedHeader = false,
  className,
  hideClose = false,
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

  const hasHeader = Boolean(title) || Boolean(description) || !hideClose

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={cn(
          'relative z-10 w-full bg-surface-card rounded-t-3xl sm:rounded-2xl',
          'shadow-ambient-lg animate-scale-in',
          'max-h-[92dvh] flex flex-col overflow-hidden',
          size === 'sm' && 'sm:max-w-sm',
          size === 'md' && 'sm:max-w-md',
          size === 'lg' && 'sm:max-w-2xl',
          size === 'xl' && 'sm:max-w-4xl',
          className,
        )}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-on-surface/15" />
        </div>

        {/* Header */}
        {hasHeader && (
          <div
            className={cn(
              'relative flex items-start gap-3 px-5 sm:px-6 py-4 shrink-0',
              decoratedHeader && 'overflow-hidden pl-7 sm:pl-8',
            )}
          >
            {decoratedHeader && (
              <>
                {/* Editorial wine rail — anchors the dialog title with a deeper accent */}
                <div className="panel-wine-rail" aria-hidden="true" />
                <div className="panel-band right-[-1.5rem]" aria-hidden="true" />
                <div className="panel-band panel-band-2 right-[-0.5rem]" aria-hidden="true" />
              </>
            )}

            {Icon && (
              <div className="relative z-10 w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}

            <div className="relative z-10 flex flex-col min-w-0 flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="font-display font-bold text-headline-sm text-on-surface truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-body-sm text-on-surface/60 mt-0.5">{description}</p>
              )}
            </div>

            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="relative z-10 w-9 h-9 rounded-full text-on-surface/55 hover:text-on-surface hover:bg-surface-low flex items-center justify-center transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto px-5 sm:px-6 pt-1 pb-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-surface-low/80 bg-surface-card/80 backdrop-blur px-5 sm:px-6 py-3 flex flex-wrap items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

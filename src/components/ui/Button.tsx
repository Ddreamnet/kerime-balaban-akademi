import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

/**
 * Kinetic CTA button — follows the design system spec.
 * Primary: gradient, min-height 56px, scale on hover.
 * Secondary: ghost with secondary text.
 * Ghost: minimal, for tertiary actions.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base — touch target, transition, font
          'inline-flex items-center justify-center gap-2',
          'font-display font-semibold tracking-tight',
          'rounded-lg transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'select-none',

          // Kinetic scale — disabled when loading/disabled
          !isDisabled && 'hover:scale-[1.02] active:scale-[0.98]',

          // Size
          size === 'sm' && 'h-10 px-4 text-sm min-w-[44px]',
          size === 'md' && 'h-12 px-6 text-base min-w-[48px]',
          size === 'lg' && 'min-h-btn px-8 text-lg min-w-[48px]',

          // Variant
          variant === 'primary' && [
            'bg-gradient-primary text-white',
            'shadow-primary-glow/30',
            !isDisabled && 'hover:shadow-primary-glow',
          ],
          variant === 'secondary' && [
            'bg-transparent border-2 border-secondary/20 text-secondary',
            !isDisabled && 'hover:bg-secondary/5 hover:border-secondary/40',
          ],
          variant === 'ghost' && [
            'bg-transparent text-on-surface/70',
            !isDisabled && 'hover:bg-surface-low hover:text-on-surface',
          ],
          variant === 'danger' && [
            'bg-primary text-white',
            !isDisabled && 'hover:bg-primary-dark',
          ],

          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? <Spinner size="sm" color="inherit" /> : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

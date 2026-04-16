import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

/**
 * Input — ghost border fallback from design system.
 * Border is felt (outline_variant at 15% opacity), not seen.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label-md text-on-surface/80 font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-md bg-surface-card px-4',
            'min-h-touch text-body-md text-on-surface',
            'border border-outline/15',
            'placeholder:text-on-surface/40',
            'transition-colors duration-150',
            'focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
            error && 'border-primary/60 focus:border-primary focus:ring-primary/20',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-body-sm text-on-surface/50">{hint}</p>
        )}
        {error && (
          <p className="text-body-sm text-primary" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label-md text-on-surface/80 font-medium"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-md bg-surface-card px-4 py-3',
            'text-body-md text-on-surface resize-none',
            'border border-outline/15',
            'placeholder:text-on-surface/40',
            'transition-colors duration-150',
            'focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
            error && 'border-primary/60 focus:border-primary focus:ring-primary/20',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-body-sm text-on-surface/50">{hint}</p>
        )}
        {error && (
          <p className="text-body-sm text-primary" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

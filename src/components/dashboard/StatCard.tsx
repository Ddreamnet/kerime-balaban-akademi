import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export type StatTone =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  /** Big number / headline value. */
  value: number | string
  /** Optional caption beneath the value (e.g. "+3 bu hafta"). */
  caption?: string
  /** Visual tone — picks icon background + accent. */
  tone?: StatTone
  /** Wrap in a Link with this destination. Renders as div otherwise. */
  to?: string
  /** Click handler (use either `to` or `onClick`, not both). */
  onClick?: () => void
  /** Force the card into a "spotlight" gradient style — for hero stats. */
  spotlight?: boolean
  className?: string
}

const TONE_STYLES: Record<StatTone, { bg: string; icon: string }> = {
  primary:   { bg: 'bg-primary-container',   icon: 'text-primary' },
  secondary: { bg: 'bg-secondary-container', icon: 'text-secondary' },
  // "neutral" gets a quiet wine wash so even subdued stats feel branded.
  neutral:   { bg: 'bg-wine-50',             icon: 'text-wine' },
  success:   { bg: 'bg-success-container',   icon: 'text-success' },
  warning:   { bg: 'bg-warning-container',   icon: 'text-warning' },
  danger:    { bg: 'bg-primary-container',   icon: 'text-primary' },
  info:      { bg: 'bg-info-container',      icon: 'text-info' },
}

/**
 * Stat card — icon + label + big number, optional caption.
 *
 * Replaces the duplicated stat-card markup in AdminDashboard, CoachDashboard,
 * ParentDashboard and various inner pages. Ships in two visual modes:
 *
 *   • Default — soft tinted icon plate on a white card.
 *   • Spotlight — full gradient hero card for primary metrics.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  tone = 'primary',
  to,
  onClick,
  spotlight = false,
  className,
}: StatCardProps) {
  const interactive = Boolean(to || onClick)

  const body = spotlight ? (
    <SpotlightBody Icon={Icon} label={label} value={value} caption={caption} />
  ) : (
    <DefaultBody
      Icon={Icon}
      label={label}
      value={value}
      caption={caption}
      tone={tone}
      interactive={interactive}
    />
  )

  const sharedClasses = cn(
    'block w-full rounded-2xl text-left transition-all duration-200',
    spotlight
      ? 'bg-gradient-primary text-white shadow-primary-glow/30 hover:shadow-primary-glow'
      : 'bg-surface-card shadow-ambient hover:shadow-ambient-md',
    interactive && 'group hover:-translate-y-0.5 active:translate-y-0',
    className,
  )

  if (to) {
    return (
      <Link to={to} className={sharedClasses}>
        {body}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={sharedClasses}>
        {body}
      </button>
    )
  }
  return <div className={sharedClasses}>{body}</div>
}

function DefaultBody({
  Icon,
  label,
  value,
  caption,
  tone,
  interactive,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  caption?: string
  tone: StatTone
  interactive: boolean
}) {
  const style = TONE_STYLES[tone]
  return (
    <div className="p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', style.bg)}>
          <Icon className={cn('w-5 h-5', style.icon)} />
        </div>
        {interactive && (
          <ChevronRight className="w-4 h-4 text-on-surface/30 group-hover:text-on-surface/60 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
      <div>
        <p className="text-label-md uppercase tracking-widest text-on-surface/55">{label}</p>
        <p className="font-display font-black text-3xl text-on-surface mt-1 leading-none">
          {value}
        </p>
        {caption && (
          <p className="text-body-sm text-on-surface/55 mt-1.5">{caption}</p>
        )}
      </div>
    </div>
  )
}

function SpotlightBody({
  Icon,
  label,
  value,
  caption,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  caption?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Diagonal accent — same DNA as HeroSection */}
      <div className="absolute -right-8 top-0 bottom-0 w-1/3 bg-white/8 -skew-x-6 pointer-events-none" />
      <div className="relative p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-label-md uppercase tracking-widest text-white/70">{label}</p>
            <p className="font-display font-black text-3xl leading-tight mt-0.5">{value}</p>
            {caption && <p className="text-body-sm text-white/75 mt-1">{caption}</p>}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  )
}

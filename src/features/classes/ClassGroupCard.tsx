import { Clock, User, Users, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { ClassGroup } from '@/types/content.types'
import { trainingDayLabels, beltLevelLabels } from '@/data/classes'

interface ClassGroupCardProps {
  group: ClassGroup
  variant?: 'default' | 'compact'
}

const dayShortLabels: Record<string, string> = {
  pazartesi: 'PAZ',
  carsamba: 'ÇAR',
  cuma: 'CUM',
}

const beltLevelBorderColors: Record<string, string> = {
  baslangic: 'border-l-yellow-400',
  orta: 'border-l-blue-500',
  ileri: 'border-l-primary',
}

export function ClassGroupCard({ group, variant = 'default' }: ClassGroupCardProps) {
  const primaryLevel = group.belt_levels[0]

  return (
    <Card
      className={cn(
        'flex flex-col gap-4 border-l-4',
        beltLevelBorderColors[primaryLevel] ?? 'border-l-primary',
        variant === 'compact' && 'gap-3'
      )}
      hoverable
    >
      {/* Top row — badges */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          {group.belt_levels.map((level) => (
            <span
              key={level}
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5',
                'text-label-sm uppercase tracking-widest font-semibold',
                level === 'baslangic' && 'bg-yellow-100 text-yellow-800',
                level === 'orta' && 'bg-blue-100 text-blue-800',
                level === 'ileri' && 'bg-red-100 text-primary',
              )}
            >
              {beltLevelLabels[level]}
            </span>
          ))}
        </div>
        <Badge variant="default">{group.age_range}</Badge>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-display text-headline-sm text-on-surface leading-tight">
          {group.name}
        </h3>
        {variant === 'default' && (
          <p className="text-body-sm text-on-surface/60 mt-1.5 leading-relaxed">
            {group.description}
          </p>
        )}
      </div>

      {/* Training days */}
      <div className="flex gap-1.5">
        {['pazartesi', 'carsamba', 'cuma'].map((day) => {
          const active = group.days.includes(day as 'pazartesi' | 'carsamba' | 'cuma')
          return (
            <span
              key={day}
              title={trainingDayLabels[day]}
              className={cn(
                'flex-1 text-center py-1.5 rounded-md text-label-sm font-semibold tracking-wide',
                'transition-colors',
                active
                  ? 'bg-secondary-container text-secondary'
                  : 'bg-surface-low text-on-surface/30'
              )}
            >
              {dayShortLabels[day]}
            </span>
          )
        })}
      </div>

      {/* Meta row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-body-sm text-on-surface/60">
          <Clock className="w-3.5 h-3.5 shrink-0 text-primary/70" />
          <span className="font-medium text-on-surface">
            {group.time_start} – {group.time_end}
          </span>
        </div>
        <div className="flex items-center gap-2 text-body-sm text-on-surface/60">
          <User className="w-3.5 h-3.5 shrink-0 text-primary/70" />
          <span>{group.instructor}</span>
        </div>
        <div className="flex items-center gap-2 text-body-sm text-on-surface/60">
          <Users className="w-3.5 h-3.5 shrink-0 text-primary/70" />
          <span>Maks. {group.capacity} öğrenci</span>
        </div>
      </div>

      {/* CTA */}
      {variant === 'default' && (
        <Link
          to="/iletisim"
          className="flex items-center gap-1 text-body-sm font-semibold text-primary hover:text-primary-dark transition-colors mt-auto pt-2"
        >
          Kayıt için iletişime geç
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </Card>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ClipboardCheck,
  Award,
  CalendarDays,
  GraduationCap,
} from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, StatCard, PanelCard } from '@/components/dashboard'
import { listAllChildren } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import { useAuth } from '@/hooks/useAuth'
import { trainingDayLabels } from '@/data/classes'
import type { TrainingDay } from '@/types/content.types'

/**
 * Coach overview — today's class call-out + roster/group counts + shortcuts.
 */
export function CoachDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<{ students: number; classes: number } | null>(null)

  useEffect(() => {
    const load = async () => {
      const [students, classes] = await Promise.all([
        listAllChildren(),
        listActiveClasses(),
      ])
      setStats({ students: students.length, classes: classes.length })
    }
    void load()
  }, [])

  const firstName = user?.full_name?.split(' ')[0] ?? ''

  // Detect if today is a training day (Mon/Wed/Fri)
  const weekday = new Date().getDay()
  const trainingToday: TrainingDay | null =
    weekday === 1 ? 'pazartesi' : weekday === 3 ? 'carsamba' : weekday === 5 ? 'cuma' : null

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        kicker="Antrenör Paneli"
        title={`Merhaba${firstName ? `, ${firstName}` : ''}`}
        titleAccent={<span className="text-2xl">👋</span>}
        description="Antrenmanlarınız ve öğrencileriniz burada."
        decorated
      />

      {/* Today's training status */}
      {trainingToday ? (
        <PanelCard
          tone="spotlight"
          decorated
          className="hover:shadow-primary-glow transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="panel-kicker-inverted">Bugün Antrenman Var</p>
              <p className="font-display font-black text-headline-sm leading-tight mt-1 text-white">
                {trainingDayLabels[trainingToday]} grubu sahada
              </p>
              <p className="text-body-md text-white/85 mt-1">
                Yoklama ve performans notlarını işaretlemeyi unutma.
              </p>
            </div>
          </div>
        </PanelCard>
      ) : (
        <PanelCard tone="warm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6 text-on-surface/55" />
            </div>
            <div>
              <p className="panel-kicker">Bugün</p>
              <p className="font-display font-bold text-title-lg text-on-surface mt-0.5">
                Antrenman yok
              </p>
              <p className="text-body-sm text-on-surface/60 mt-1">
                Pazartesi, Çarşamba ve Cuma antrenman günleridir.
              </p>
            </div>
          </div>
        </PanelCard>
      )}

      {/* Stats */}
      {!stats ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={GraduationCap}
            label="Öğrenciler"
            value={stats.students}
            tone="primary"
            to="/antrenor/ogrenciler"
          />
          <StatCard
            icon={Users}
            label="Aktif Gruplar"
            value={stats.classes}
            tone="secondary"
            to="/antrenor/gruplar"
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction
          to="/antrenor/devamsizlik"
          icon={ClipboardCheck}
          label="Yoklama Al"
        />
        <QuickAction
          to="/antrenor/notlar"
          icon={Award}
          label="Performans Gir"
        />
      </div>
    </div>
  )
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Link to={to} className="group">
      <PanelCard
        hoverable
        padding="sm"
        className="hover:bg-primary-tint transition-colors"
      >
        <div className="flex flex-col items-center gap-2 py-1 text-center">
          <div className="w-11 h-11 rounded-xl bg-primary-container/80 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-body-sm font-semibold text-on-surface">{label}</span>
        </div>
      </PanelCard>
    </Link>
  )
}

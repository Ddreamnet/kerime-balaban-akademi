import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ClipboardCheck,
  Award,
  CalendarDays,
  ChevronRight,
  GraduationCap,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { listAllChildren } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import { useAuth } from '@/hooks/useAuth'
import { trainingDayLabels } from '@/data/classes'
import type { TrainingDay } from '@/types/content.types'

/**
 * Coach overview — shows today's classes and student stats.
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

  const firstName = user?.full_name?.split(' ')[0]

  // Detect if today is a training day (Mon/Wed/Fri)
  const weekday = new Date().getDay()
  const trainingToday: TrainingDay | null =
    weekday === 1 ? 'pazartesi' : weekday === 3 ? 'carsamba' : weekday === 5 ? 'cuma' : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Antrenör Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">
          Merhaba{firstName ? `, ${firstName}` : ''} 👋
        </h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          Antrenmanlarınız ve öğrencileriniz burada.
        </p>
      </div>

      {/* Today's training status */}
      <Card
        className={
          trainingToday
            ? 'bg-gradient-primary text-white border-0 shadow-primary-glow/30'
            : ''
        }
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              trainingToday
                ? 'bg-white/15'
                : 'bg-surface-low text-on-surface/50'
            }`}
          >
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p
              className={`text-label-md uppercase tracking-widest ${
                trainingToday ? 'text-white/70' : 'text-on-surface/40'
              }`}
            >
              Bugün
            </p>
            {trainingToday ? (
              <>
                <p className="font-display font-black text-headline-sm leading-tight mt-0.5">
                  {trainingDayLabels[trainingToday]} Antrenmanı
                </p>
                <p className="text-body-md text-white/80 mt-1">
                  Bugün antrenman günü. Öğrencilerini kontrol et.
                </p>
              </>
            ) : (
              <>
                <p className="font-display font-bold text-title-lg text-on-surface mt-0.5">
                  Antrenman yok
                </p>
                <p className="text-body-sm text-on-surface/60 mt-1">
                  Pazartesi, Çarşamba ve Cuma antrenman günleridir.
                </p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      {!stats ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatLink
            to="/antrenor/ogrenciler"
            icon={GraduationCap}
            label="Öğrenciler"
            value={stats.students}
            accent="primary"
          />
          <StatLink
            to="/antrenor/gruplar"
            icon={Users}
            label="Aktif Gruplar"
            value={stats.classes}
            accent="secondary"
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link to="/antrenor/devamsizlik" className="group">
          <Card hoverable className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-on-surface/60" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-title-md text-on-surface">
                Devamsızlık Al
              </p>
              <p className="text-body-sm text-on-surface/50">
                Bugünkü dersin yoklamasını işaretle
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface/40 group-hover:translate-x-0.5 transition-transform" />
          </Card>
        </Link>
        <Link to="/antrenor/notlar" className="group">
          <Card hoverable className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center">
              <Award className="w-5 h-5 text-on-surface/60" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-title-md text-on-surface">
                Performans Gir
              </p>
              <p className="text-body-sm text-on-surface/50">
                Öğrenci performansını değerlendir
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface/40 group-hover:translate-x-0.5 transition-transform" />
          </Card>
        </Link>
      </div>
    </div>
  )
}

interface StatLinkProps {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  accent: 'primary' | 'secondary'
}

function StatLink({ to, icon: Icon, label, value, accent }: StatLinkProps) {
  const accentClasses = {
    primary: 'bg-primary-container text-primary',
    secondary: 'bg-secondary-container text-secondary',
  }[accent]

  return (
    <Link to={to} className="group">
      <Card hoverable className="h-full">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
          <ChevronRight className="w-4 h-4 text-on-surface/30 group-hover:text-on-surface/60 group-hover:translate-x-0.5 transition-all" />
        </div>
        <div className="mt-4">
          <p className="text-label-md uppercase tracking-widest text-on-surface/50">
            {label}
          </p>
          <p className="font-display font-black text-3xl text-on-surface mt-1">
            {value}
          </p>
        </div>
      </Card>
    </Link>
  )
}

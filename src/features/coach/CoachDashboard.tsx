import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ClipboardCheck,
  Award,
  CalendarDays,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, StatCard, PanelCard } from '@/components/dashboard'
import { listAllChildren } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import { listClassIdsForCoach } from '@/lib/classCoaches'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { trainingDayLabels } from '@/data/classes'
import { todayIsoTrt } from '@/utils/format'
import type { ClassGroup } from '@/types/content.types'

const TR_DOW = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const

interface DashboardStats {
  students: number
  classes: number
  unmarkedToday: number
  /** Coach'un atandığı, bugün antrenmanı olan class'lar */
  todayClasses: ClassGroup[]
}

/**
 * Coach overview — atanmış branşlar, bugünkü antrenman, öğrenci/grup sayıları
 * + bugünkü işaretlenmemiş lesson uyarısı (paket sistem).
 */
export function CoachDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const today = todayIsoTrt()
      const todayDow = TR_DOW[new Date().getDay()]

      const [allStudents, allClasses, myClassIds] = await Promise.all([
        listAllChildren(),
        listActiveClasses(),
        listClassIdsForCoach(user.id),
      ])
      const myClassIdSet = new Set(myClassIds)
      const myClasses = allClasses.filter((c) => myClassIdSet.has(c.id))
      const myStudents = allStudents.filter((s) =>
        s.class_group_id ? myClassIdSet.has(s.class_group_id) : false,
      )

      const todayClasses = myClasses.filter((c) => c.days.includes(todayDow))

      let unmarkedToday = 0
      if (myClasses.length > 0) {
        const { count } = await supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .in('class_id', myClasses.map((c) => c.id))
          .eq('scheduled_date', today)
          .eq('status', 'scheduled')
        unmarkedToday = count ?? 0
      }

      setStats({
        students: myStudents.length,
        classes: myClasses.length,
        unmarkedToday,
        todayClasses,
      })
    }
    void load()
  }, [user])

  const firstName = user?.full_name?.split(' ')[0] ?? ''
  const todayDow = TR_DOW[new Date().getDay()]

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        kicker="Antrenör Paneli"
        title={`Merhaba${firstName ? `, ${firstName}` : ''}`}
        titleAccent={<span className="text-2xl">👋</span>}
        description="Antrenmanlarınız ve öğrencileriniz burada."
        decorated
      />

      {/* İşaretlenmemiş yoklama uyarısı (öncelik) */}
      {stats && stats.unmarkedToday > 0 && (
        <Link to="/antrenor/devamsizlik" className="block">
          <PanelCard tone="warm" hoverable className="border-l-4 border-amber-400">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-title-md text-on-surface">
                  Bugün {stats.unmarkedToday} ders için yoklama bekliyor
                </p>
                <p className="text-body-sm text-on-surface/65 mt-0.5">
                  Hemen işaretlemek için tıkla.
                </p>
              </div>
            </div>
          </PanelCard>
        </Link>
      )}

      {/* Today's training status — coach'un kendi class'larına göre */}
      {stats && stats.todayClasses.length > 0 ? (
        <PanelCard tone="spotlight" decorated className="hover:shadow-primary-glow transition-shadow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="panel-kicker-inverted">Bugün Antrenman Var</p>
              <p className="font-display font-black text-headline-sm leading-tight mt-1 text-white">
                {trainingDayLabels[todayDow]} ·{' '}
                {stats.todayClasses.length === 1
                  ? stats.todayClasses[0].name
                  : `${stats.todayClasses.length} grup`}
              </p>
              <ul className="flex flex-col gap-0.5 mt-1.5 text-body-sm text-white/85">
                {stats.todayClasses.map((c) => (
                  <li key={c.id}>
                    {c.name} — {c.time_start}–{c.time_end}
                  </li>
                ))}
              </ul>
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
              <p className="panel-kicker">Bugün ({trainingDayLabels[todayDow]})</p>
              <p className="font-display font-bold text-title-lg text-on-surface mt-0.5">
                Antrenman yok
              </p>
              <p className="text-body-sm text-on-surface/60 mt-1">
                {stats && stats.classes === 0
                  ? 'Henüz sana atanmış grup yok.'
                  : 'Bugünün takvimine göre senin gruplarından bir antrenman yok.'}
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
            label="Öğrencilerim"
            value={stats.students}
            tone="primary"
            to="/antrenor/ogrenciler"
          />
          <StatCard
            icon={Users}
            label="Gruplarım"
            value={stats.classes}
            tone="secondary"
            to="/antrenor/gruplar"
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction to="/antrenor/devamsizlik" icon={ClipboardCheck} label="Yoklama Al" />
        <QuickAction to="/antrenor/notlar" icon={Award} label="Performans Gir" />
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
      <PanelCard hoverable padding="sm" className="hover:bg-primary-tint transition-colors">
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

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Baby,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, PanelCard } from '@/components/dashboard'
import { useAuth } from '@/hooks/useAuth'
import { getMyChild, type Child } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import { beltLevelLabels, beltLevelColors, trainingDayLabels } from '@/data/classes'
import type { ClassGroup } from '@/types/content.types'
import { cn } from '@/utils/cn'

export function ParentDashboard() {
  const { user } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setIsLoading(true)
      const [c, cls] = await Promise.all([
        getMyChild(user.id),
        listActiveClasses(),
      ])
      setChild(c)
      setClasses(cls)
      setIsLoading(false)
    }
    void load()
  }, [user])

  const childClass = classes.find((c) => c.id === child?.class_group_id)
  const firstName = user?.full_name?.split(' ')[0] ?? ''

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        kicker="Veli Paneli"
        title={`Merhaba${firstName ? `, ${firstName}` : ''}`}
        titleAccent={<span className="text-2xl">👋</span>}
        description="Çocuğunuzun gelişim ve antrenman bilgileri."
        decorated
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !child ? (
        <RegisterChildCTA />
      ) : (
        <div className="flex flex-col gap-5">
          <ChildSummaryCard child={child} classGroup={childClass ?? null} />
          <UpcomingTrainingCard classGroup={childClass ?? null} />
          <QuickLinksRow />
        </div>
      )}
    </div>
  )
}

// ─── No child yet: primary CTA ──────────────────────────────────────────────

function RegisterChildCTA() {
  return (
    <PanelCard tone="spotlight" decorated padding="lg">
      <div className="flex flex-col md:flex-row items-start gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
          <Baby className="w-7 h-7" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h2 className="font-display font-black text-headline-md leading-tight text-white">
            Çocuğunuzu kaydedin
          </h2>
          <p className="text-body-md text-white/85 leading-relaxed">
            Akademi deneyiminizi başlatmak için çocuğunuzun bilgilerini girin.
            Ad, yaş ve grup seçimiyle birkaç saniyede tamamlanır.
          </p>
          <Link
            to="/veli/cocugum"
            className={cn(
              'inline-flex items-center gap-1.5 mt-3 px-5 py-2.5 rounded-xl self-start',
              'bg-white text-primary font-semibold shadow-ambient',
              'hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150',
            )}
          >
            <Plus className="w-4 h-4" />
            Çocuğumu Kaydet
          </Link>
        </div>
      </div>
    </PanelCard>
  )
}

// ─── Child summary card ────────────────────────────────────────────────────

function ChildSummaryCard({
  child,
  classGroup,
}: {
  child: Child
  classGroup: ClassGroup | null
}) {
  const beltClass = child.belt_level ? beltLevelColors[child.belt_level] : null

  return (
    <Link to="/veli/cocugum" className="group block">
      <PanelCard
        decorated
        padding="md"
        hoverable
        className="hover:shadow-ambient-md transition-shadow"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-primary-glow-sm overflow-hidden">
            {child.avatar_url ? (
              <img
                src={child.avatar_url}
                alt={child.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display font-black text-white text-2xl">
                {child.full_name[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="panel-kicker">Öğrenci</p>
            <h2 className="font-display font-bold text-headline-sm text-on-surface truncate mt-0.5">
              {child.full_name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {beltClass && child.belt_level && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5',
                    'text-label-sm font-semibold uppercase tracking-widest',
                    beltClass,
                  )}
                >
                  {beltLevelLabels[child.belt_level]} Kuşak
                </span>
              )}
              {classGroup && <Badge variant="secondary">{classGroup.name}</Badge>}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-on-surface/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </PanelCard>
    </Link>
  )
}

// ─── Next training session card ───────────────────────────────────────────

function UpcomingTrainingCard({ classGroup }: { classGroup: ClassGroup | null }) {
  if (!classGroup) {
    return (
      <PanelCard tone="warm">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-warning-container text-warning flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-title-md text-on-surface">
              Grup seçimi yapılmadı
            </p>
            <p className="text-body-sm text-on-surface/60 mt-1">
              Antrenman programını görmek için çocuğunuzun grubunu seçin.
            </p>
            <Link
              to="/veli/cocugum"
              className="text-body-sm text-primary font-semibold hover:underline mt-2 inline-block"
            >
              Çocuğum sayfasına git →
            </Link>
          </div>
        </div>
      </PanelCard>
    )
  }

  return (
    <PanelCard className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="panel-kicker">Antrenman Programı</p>
          <p className="font-display font-bold text-title-lg text-on-surface mt-0.5">
            {classGroup.name}
          </p>
          <p className="text-body-sm text-on-surface/60">
            {classGroup.time_start} – {classGroup.time_end}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {classGroup.days.map((day) => (
          <div
            key={day}
            className="bg-secondary-tint border border-secondary-container/60 rounded-xl px-3 py-2 text-center"
          >
            <p className="font-display font-semibold text-body-sm text-secondary">
              {trainingDayLabels[day]}
            </p>
          </div>
        ))}
      </div>
    </PanelCard>
  )
}

// ─── Quick action links ────────────────────────────────────────────────────

function QuickLinksRow() {
  const links: Array<{
    to: string
    icon: React.ComponentType<{ className?: string }>
    label: string
  }> = [
    { to: '/veli/gelisim',        icon: TrendingUp,     label: 'Gelişim' },
    { to: '/veli/devamsizlik',    icon: ClipboardCheck, label: 'Devamsızlık' },
    { to: '/veli/odemeler',       icon: CreditCard,     label: 'Ödemeler' },
    { to: '/veli/bildirimler',    icon: Bell,           label: 'Bildirimler' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {links.map(({ to, icon: Icon, label }) => (
        <Link key={to} to={to} className="group">
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
      ))}
    </div>
  )
}

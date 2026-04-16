import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Baby,
  CalendarDays,
  ChevronRight,
  Cake,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { getMyChild, type Child } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import { beltLevelLabels, trainingDayLabels } from '@/data/classes'
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
  const firstName = user?.full_name?.split(' ')[0]

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Veli Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">
          Merhaba{firstName ? `, ${firstName}` : ''} 👋
        </h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          Akademimize hoş geldiniz.
        </p>
      </div>

      {/* Content */}
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
    <Card className="bg-gradient-to-br from-primary via-primary to-primary-gradient text-white border-0 shadow-primary-glow/30 p-8">
      <div className="flex flex-col md:flex-row items-start gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
          <Baby className="w-7 h-7" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h2 className="font-display font-black text-headline-md leading-tight">
            Çocuğunuzu kaydedin
          </h2>
          <p className="text-body-md text-white/80 leading-relaxed">
            Akademi deneyiminizi başlatmak için çocuğunuzun bilgilerini girin.
            Ad, yaş ve grup seçimiyle birkaç saniyede tamamlanır.
          </p>
          <Link
            to="/veli/cocugum"
            className={cn(
              'inline-flex items-center gap-1.5 mt-3 px-5 py-2.5 rounded-lg self-start',
              'bg-white text-primary font-semibold shadow-ambient',
              'hover:scale-[1.02] transition-all duration-150'
            )}
          >
            <Plus className="w-4 h-4" />
            Çocuğumu Kaydet
          </Link>
        </div>
      </div>
    </Card>
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
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-primary-glow/20">
            {child.avatar_url ? (
              <img
                src={child.avatar_url}
                alt={child.full_name}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <span className="font-display font-black text-white text-xl">
                {child.full_name[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">Öğrenci</p>
            <h2 className="font-display font-bold text-headline-sm text-on-surface truncate">
              {child.full_name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {child.belt_level && (
                <Badge variant="primary">{beltLevelLabels[child.belt_level]} Kuşak</Badge>
              )}
              {classGroup && <Badge variant="secondary">{classGroup.name}</Badge>}
            </div>
          </div>
        </div>
        <Link
          to="/veli/cocugum"
          className="flex items-center gap-1 text-body-sm font-semibold text-primary hover:text-primary-dark transition-colors shrink-0"
        >
          Detay
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  )
}

// ─── Next training session card ───────────────────────────────────────────

function UpcomingTrainingCard({ classGroup }: { classGroup: ClassGroup | null }) {
  if (!classGroup) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-yellow-700" />
          </div>
          <div>
            <p className="font-display font-semibold text-title-md text-on-surface">
              Grup seçimi yapılmadı
            </p>
            <p className="text-body-sm text-on-surface/60 mt-1">
              Antrenman programı için çocuğunuzun grubunu seçin.
            </p>
            <Link
              to="/veli/cocugum"
              className="text-body-sm text-primary font-semibold hover:underline mt-2 inline-block"
            >
              Çocuğum sayfasına git →
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">
            Antrenman Programı
          </p>
          <p className="font-display font-semibold text-title-md text-on-surface mt-0.5">
            {classGroup.time_start} – {classGroup.time_end}
          </p>
        </div>
      </div>

      {/* Days pills */}
      <div className="flex gap-2">
        {classGroup.days.map((day) => (
          <div
            key={day}
            className="flex-1 bg-secondary-container text-secondary rounded-md px-3 py-2 text-center"
          >
            <p className="font-display font-semibold text-body-sm">
              {trainingDayLabels[day]}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Quick action links ────────────────────────────────────────────────────

function QuickLinksRow() {
  const links = [
    { to: '/veli/cocugum', icon: Baby, label: 'Çocuğum' },
    { to: '/veli/devamsizlik', icon: Users, label: 'Devamsızlık' },
    { to: '/veli/sinavlar', icon: ShieldCheck, label: 'Sınavlar' },
    { to: '/veli/bildirimler', icon: Cake, label: 'Bildirimler' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {links.map(({ to, icon: Icon, label }) => (
        <Link key={to} to={to} className="group">
          <Card hoverable padding="sm" className="flex flex-col items-center gap-2 py-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center group-hover:bg-primary-container transition-colors">
              <Icon className="w-5 h-5 text-on-surface/60 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-body-sm font-semibold text-on-surface/80">{label}</span>
          </Card>
        </Link>
      ))}
    </div>
  )
}


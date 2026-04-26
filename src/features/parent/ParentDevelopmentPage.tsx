import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Baby, Images, List, Ruler, Scale, Sparkles, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader } from '@/components/dashboard'
import { getMyChild, type Child } from '@/lib/children'
import { listRecordsForChild, type PerformanceRecord } from '@/lib/performance'
import { useAuth } from '@/hooks/useAuth'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'
import { PerformanceTimeline } from '@/features/performance/PerformanceTimeline'
import { PerformancePhotoGallery } from '@/features/performance/PerformancePhotoGallery'

type Tab = 'timeline' | 'photos'

export function ParentDevelopmentPage() {
  const { user } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [records, setRecords] = useState<PerformanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('timeline')

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    void (async () => {
      const c = await getMyChild(user.id)
      if (cancelled) return
      setChild(c)
      if (c) {
        const recs = await listRecordsForChild(c.id)
        if (!cancelled) setRecords(recs)
      }
      if (!cancelled) setIsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!child) {
    return (
      <div className="flex flex-col gap-5 max-w-3xl">
        <Header />
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <Baby className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            Önce çocuğunuzu kaydedin
          </p>
          <p className="text-body-md text-on-surface/60 max-w-sm">
            Gelişim takibi için önce "Çocuğum" sayfasından kayıt oluşturmalısınız.
          </p>
          <Link
            to="/veli/cocugum"
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white font-semibold text-body-sm hover:bg-primary-dark transition-colors"
          >
            Çocuğuma git
          </Link>
        </Card>
      </div>
    )
  }

  const latest = records[0] ?? null

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Header childName={child.full_name} />

      {latest && <LatestSummary record={latest} previous={records[1] ?? null} />}

      <div className="flex flex-col gap-4">
        <Tabs tab={tab} onChange={setTab} />
        {tab === 'timeline' ? (
          <PerformanceTimeline
            records={records}
            title="Gelişim Geçmişi"
            emptyHint="Antrenörünüz ölçüm eklediğinde burada tarih sırasına göre görürsünüz."
          />
        ) : (
          <PerformancePhotoGallery records={records} />
        )}
      </div>
    </div>
  )
}

function Tabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: { key: Tab; label: string; icon: typeof List }[] = [
    { key: 'timeline', label: 'Zaman Çizgisi', icon: List },
    { key: 'photos', label: 'Fotoğraflar', icon: Images },
  ]
  return (
    <div className="flex gap-1 border-b border-surface-low">
      {items.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-body-sm font-semibold transition-colors',
            'border-b-2 -mb-px min-h-touch',
            tab === t.key
              ? 'text-primary border-primary'
              : 'text-on-surface/60 border-transparent hover:text-on-surface',
          )}
        >
          <t.icon className="w-4 h-4" />
          {t.label}
        </button>
      ))}
    </div>
  )
}

function Header({ childName }: { childName?: string }) {
  return (
    <PageHeader
      kicker="Veli Paneli"
      title="Gelişim Takibi"
      description={childName ? `${childName} için ölçüm ve gelişim geçmişi` : undefined}
    />
  )
}

function LatestSummary({
  record,
  previous,
}: {
  record: PerformanceRecord
  previous: PerformanceRecord | null
}) {
  const stats: { icon: typeof TrendingUp; label: string; value: number | null; unit: string; prev: number | null }[] = [
    {
      icon: TrendingUp,
      label: 'Boy',
      value: record.height_cm,
      unit: 'cm',
      prev: previous?.height_cm ?? null,
    },
    {
      icon: Scale,
      label: 'Kilo',
      value: record.weight_kg,
      unit: 'kg',
      prev: previous?.weight_kg ?? null,
    },
    {
      icon: Ruler,
      label: 'Kerme',
      value: record.split_cm,
      unit: 'cm',
      prev: previous?.split_cm ?? null,
    },
  ].filter((s) => s.value !== null)

  return (
    <Card className="flex flex-col gap-4 bg-gradient-to-br from-primary/5 to-surface-card">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-label-sm text-primary uppercase tracking-widest font-semibold">
            Son Ölçüm
          </p>
          <p className="font-display font-bold text-title-md text-on-surface mt-1">
            {formatDateLong(record.recorded_at)}
          </p>
        </div>
        {record.exam_ready && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary text-white px-3 py-1 text-label-sm font-semibold">
            <Sparkles className="w-3 h-3" />
            Sınava Hazır
          </span>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <StatTile key={s.label} {...s} />
          ))}
        </div>
      )}

      {record.general_note && (
        <p className="text-body-md text-on-surface/80 leading-relaxed border-l-2 border-primary/30 pl-3 italic">
          {record.general_note}
        </p>
      )}
    </Card>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  unit,
  prev,
}: {
  icon: typeof TrendingUp
  label: string
  value: number | null
  unit: string
  prev: number | null
}) {
  if (value === null) return null
  const delta = prev !== null ? value - prev : null
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1)

  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface-card p-3 shadow-ambient">
      <div className="flex items-center gap-1.5 text-on-surface/50">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-label-sm uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="font-display font-black text-title-lg text-on-surface tabular-nums">
        {formatted}
        <span className="text-body-sm text-on-surface/50 font-normal ml-1">{unit}</span>
      </p>
      {delta !== null && delta !== 0 && (
        <p
          className={`text-label-sm font-semibold tabular-nums ${
            delta > 0 ? 'text-emerald-600' : 'text-amber-600'
          }`}
        >
          {delta > 0 ? '+' : ''}
          {Number.isInteger(delta) ? delta : delta.toFixed(1)} {unit}
        </p>
      )}
    </div>
  )
}

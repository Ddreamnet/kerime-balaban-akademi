import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Check,
  X,
  Info,
  Users as UsersIcon,
  BarChart3,
  CalendarDays,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { listAllClasses } from '@/lib/classes'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import {
  getAttendanceByRange,
  computeStats,
  ATTENDANCE_LABELS,
  type AttendanceRecord,
  type AttendanceStatus,
} from '@/lib/attendance'
import type { ClassGroup } from '@/types/content.types'
import { PageHeader } from '@/components/dashboard'
import { cn } from '@/utils/cn'
import { formatDateLong, formatDateShort } from '@/utils/format'

type ViewMode = 'daily' | 'summary'

export function AdminAttendancePage() {
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [allChildren, setAllChildren] = useState<ChildWithParent[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRecordsLoading, setIsRecordsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('daily')

  // 30-day range for summary view
  const summaryRange = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }, [])

  // Load classes + children once
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const [cls, ch] = await Promise.all([listAllClasses(), listAllChildren()])
      setClasses(cls)
      setAllChildren(ch)
      setIsLoading(false)
    }
    void load()
  }, [])

  // Load attendance records when filters change
  useEffect(() => {
    const load = async () => {
      setIsRecordsLoading(true)
      if (viewMode === 'daily') {
        const list = await getAttendanceByRange(date, date, selectedClassId)
        setRecords(list)
      } else {
        const list = await getAttendanceByRange(
          summaryRange.start,
          summaryRange.end,
          selectedClassId,
        )
        setRecords(list)
      }
      setIsRecordsLoading(false)
    }
    void load()
  }, [date, selectedClassId, viewMode, summaryRange])

  const changeDate = (days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

  // ─── Daily view helpers ────────────────────────────────────────────────
  const dailyStats = useMemo(() => computeStats(records), [records])

  const dailyByChild = useMemo(() => {
    const map = new Map<string, AttendanceStatus>()
    records.forEach((r) => map.set(r.child_id, r.status))
    return map
  }, [records])

  const filteredChildren = useMemo(() => {
    if (!selectedClassId) return allChildren
    return allChildren.filter((c) => c.class_group_id === selectedClassId)
  }, [allChildren, selectedClassId])

  // ─── Summary view helpers ──────────────────────────────────────────────
  const summaryByChild = useMemo(() => {
    const map = new Map<string, AttendanceRecord[]>()
    records.forEach((r) => {
      const list = map.get(r.child_id) ?? []
      list.push(r)
      map.set(r.child_id, list)
    })
    return map
  }, [records])

  const summaryRows = useMemo(() => {
    return filteredChildren
      .map((child) => {
        const childRecords = summaryByChild.get(child.id) ?? []
        const stats = computeStats(childRecords)
        return { child, stats }
      })
      .sort((a, b) => a.stats.presentRate - b.stats.presentRate)
  }, [filteredChildren, summaryByChild])

  const classNameMap = useMemo(() => {
    const map = new Map<string, string>()
    classes.forEach((c) => map.set(c.id, c.name))
    return map
  }, [classes])

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Devamsızlık"
        description="Tüm gruplar ve öğrencilerin yoklama durumunu görüntüleyin."
      />


      {/* View mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('daily')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-body-sm font-semibold transition-colors',
            viewMode === 'daily'
              ? 'bg-primary text-white'
              : 'bg-surface-card text-on-surface/60 hover:bg-surface-low shadow-ambient',
          )}
        >
          <CalendarDays className="w-4 h-4" />
          Günlük Görünüm
        </button>
        <button
          onClick={() => setViewMode('summary')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-body-sm font-semibold transition-colors',
            viewMode === 'summary'
              ? 'bg-primary text-white'
              : 'bg-surface-card text-on-surface/60 hover:bg-surface-low shadow-ambient',
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Son 30 Gün Özeti
        </button>
      </div>

      {/* Controls */}
      <Card className="flex flex-col gap-4">
        {/* Date selector — daily only */}
        {viewMode === 'daily' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => changeDate(-1)} aria-label="Önceki gün">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 flex flex-col items-center">
                <p className="font-display font-bold text-title-md text-on-surface">
                  {formatDateLong(date)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => changeDate(1)} aria-label="Sonraki gün">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md bg-surface-low border border-outline/15 px-3 py-1.5 text-body-sm focus:outline-none focus:border-primary/50"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="text-body-sm"
              >
                Bugüne dön
              </Button>
            </div>
          </div>
        )}

        {/* Summary range info */}
        {viewMode === 'summary' && (
          <div className="flex items-center gap-2 justify-center text-body-sm text-on-surface/60">
            <CalendarDays className="w-4 h-4" />
            {formatDateShort(summaryRange.start)} — {formatDateShort(summaryRange.end)}
          </div>
        )}

        {/* Class filter */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-low">
          <span className="text-label-md text-on-surface/80 font-medium">Grup Filtresi</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedClassId(null)}
              className={cn(
                'px-3 py-2 rounded-lg text-body-sm font-semibold transition-colors',
                !selectedClassId
                  ? 'bg-primary text-white'
                  : 'bg-surface-low text-on-surface/70 hover:bg-surface-high',
              )}
            >
              Tümü
            </button>
            {classes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={cn(
                  'px-3 py-2 rounded-lg text-body-sm font-semibold transition-colors',
                  selectedClassId === c.id
                    ? 'bg-primary text-white'
                    : 'bg-surface-low text-on-surface/70 hover:bg-surface-high',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading */}
      {(isLoading || isRecordsLoading) && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* ─── Daily View ─────────────────────────────────────────────────── */}
      {!isLoading && !isRecordsLoading && viewMode === 'daily' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <StatTile label="Toplam" value={filteredChildren.length} variant="neutral" />
            <StatTile label="Geldi" value={dailyStats.present} variant="success" />
            <StatTile label="Gelmedi" value={dailyStats.absent} variant="danger" />
            <StatTile label="Mazeret" value={dailyStats.excused} variant="warning" />
            <StatTile
              label="İşaretsiz"
              value={filteredChildren.length - dailyByChild.size}
              variant="muted"
            />
          </div>

          {/* Student list */}
          {filteredChildren.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 py-12 text-center">
              <UsersIcon className="w-10 h-10 text-on-surface/30" />
              <p className="font-display font-bold text-title-lg text-on-surface">
                Kayıtlı öğrenci yok
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredChildren.map((child) => {
                const status = dailyByChild.get(child.id)
                const className = child.class_group_id
                  ? classNameMap.get(child.class_group_id)
                  : null
                return (
                  <DailyRow
                    key={child.id}
                    name={child.full_name}
                    avatarUrl={child.avatar_url}
                    className={className ?? null}
                    parentName={child.parent_name}
                    status={status}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ─── Summary View ───────────────────────────────────────────────── */}
      {!isLoading && !isRecordsLoading && viewMode === 'summary' && (
        <>
          {/* Overall stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <StatTile label="Öğrenci" value={filteredChildren.length} variant="neutral" />
            <StatTile label="Toplam Yoklama" value={records.length} variant="neutral" />
            <StatTile
              label="Ort. Katılım"
              value={records.length > 0
                ? Math.round(
                    (records.filter((r) => r.status === 'present').length / records.length) * 100,
                  )
                : 0}
              variant="success"
              suffix="%"
            />
            <StatTile
              label="Devamsız Oran"
              value={records.length > 0
                ? Math.round(
                    (records.filter((r) => r.status === 'absent').length / records.length) * 100,
                  )
                : 0}
              variant="danger"
              suffix="%"
            />
          </div>

          {summaryRows.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 py-12 text-center">
              <ClipboardCheck className="w-10 h-10 text-on-surface/30" />
              <p className="font-display font-bold text-title-lg text-on-surface">
                Henüz yoklama kaydı yok
              </p>
              <p className="text-body-md text-on-surface/60">
                Antrenörler yoklama aldığında burada görünecek.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {summaryRows.map(({ child, stats }) => {
                const className = child.class_group_id
                  ? classNameMap.get(child.class_group_id)
                  : null
                return (
                  <SummaryRow
                    key={child.id}
                    name={child.full_name}
                    avatarUrl={child.avatar_url}
                    className={className ?? null}
                    stats={stats}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Stat tile ───────────────────────────────────────────────────────────────

interface StatTileProps {
  label: string
  value: number
  variant: 'neutral' | 'success' | 'danger' | 'warning' | 'muted'
  suffix?: string
}

function StatTile({ label, value, variant, suffix }: StatTileProps) {
  const classes = {
    neutral: 'bg-surface-card text-on-surface',
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-primary',
    warning: 'bg-yellow-50 text-yellow-700',
    muted: 'bg-surface-low text-on-surface/50',
  }[variant]

  return (
    <div className={cn('rounded-lg py-3 px-2 shadow-ambient', classes)}>
      <p className="font-display font-black text-2xl leading-none">
        {value}{suffix}
      </p>
      <p className="text-label-sm uppercase tracking-widest mt-1 opacity-80">{label}</p>
    </div>
  )
}

// ─── Daily row ───────────────────────────────────────────────────────────────

interface DailyRowProps {
  name: string
  avatarUrl: string | null
  className: string | null
  parentName: string
  status: AttendanceStatus | undefined
}

function DailyRow({ name, avatarUrl, className, parentName, status }: DailyRowProps) {
  const statusConfig = status
    ? {
        present: {
          bg: 'bg-green-50 border-green-500',
          icon: Check,
          iconColor: 'text-green-600',
          label: ATTENDANCE_LABELS.present,
          badgeVariant: 'success' as const,
        },
        absent: {
          bg: 'bg-red-50 border-primary',
          icon: X,
          iconColor: 'text-primary',
          label: ATTENDANCE_LABELS.absent,
          badgeVariant: 'error' as const,
        },
        excused: {
          bg: 'bg-yellow-50 border-yellow-500',
          icon: Info,
          iconColor: 'text-yellow-700',
          label: ATTENDANCE_LABELS.excused,
          badgeVariant: 'warning' as const,
        },
      }[status]
    : null

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl p-3 border-l-4 shadow-ambient',
        statusConfig ? statusConfig.bg : 'bg-surface-card border-transparent',
      )}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="font-display font-bold text-white">
            {name[0]?.toUpperCase() ?? '?'}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-title-md text-on-surface truncate">
          {name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {className && (
            <span className="text-label-sm text-on-surface/50">{className}</span>
          )}
          {className && parentName && (
            <span className="text-on-surface/20">·</span>
          )}
          {parentName && (
            <span className="text-label-sm text-on-surface/40">{parentName}</span>
          )}
        </div>
      </div>

      {statusConfig ? (
        <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>
      ) : (
        <span className="text-body-sm text-on-surface/30 shrink-0">—</span>
      )}
    </div>
  )
}

// ─── Summary row ─────────────────────────────────────────────────────────────

interface SummaryRowProps {
  name: string
  avatarUrl: string | null
  className: string | null
  stats: ReturnType<typeof computeStats>
}

function SummaryRow({ name, avatarUrl, className, stats }: SummaryRowProps) {
  const rateColor =
    stats.presentRate >= 80
      ? 'text-green-600'
      : stats.presentRate >= 50
        ? 'text-yellow-600'
        : 'text-primary'

  const barColor =
    stats.presentRate >= 80
      ? 'bg-green-500'
      : stats.presentRate >= 50
        ? 'bg-yellow-500'
        : 'bg-primary'

  return (
    <div className="flex items-center gap-3 rounded-xl p-3 bg-surface-card shadow-ambient">
      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="font-display font-bold text-white">
            {name[0]?.toUpperCase() ?? '?'}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-display font-semibold text-title-md text-on-surface truncate">
            {name}
          </p>
          {className && (
            <span className="text-label-sm text-on-surface/40 shrink-0">{className}</span>
          )}
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-2 rounded-full bg-surface-low overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', barColor)}
              style={{ width: `${stats.presentRate}%` }}
            />
          </div>
          <span className="text-label-sm text-on-surface/50 shrink-0 tabular-nums">
            {stats.present}/{stats.total}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className={cn('font-display font-black text-xl leading-none', rateColor)}>
          %{stats.presentRate}
        </p>
        <p className="text-label-sm text-on-surface/40 mt-0.5">katılım</p>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Check, X, Info, Users as UsersIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { listActiveClasses } from '@/lib/classes'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import {
  getAttendanceForClassDate,
  upsertAttendance,
  ATTENDANCE_LABELS,
  type AttendanceStatus,
} from '@/lib/attendance'
import type { ClassGroup } from '@/types/content.types'
import { trainingDayLabels } from '@/data/classes'
import { PageHeader } from '@/components/dashboard'
import { cn } from '@/utils/cn'
import { formatDateLong } from '@/utils/format'

/**
 * Coach: attendance marking.
 *
 * Flow:
 *  1. Select a class group (defaults to first)
 *  2. Select a date (defaults to today)
 *  3. List children enrolled in that class
 *  4. Tap each child → cycles: unmarked → present → absent → excused
 *  5. Auto-saves on tap (upsert)
 */
export function CoachAttendancePage() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [allChildren, setAllChildren] = useState<ChildWithParent[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState<Map<string, AttendanceStatus>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [savingChildId, setSavingChildId] = useState<string | null>(null)

  // Load classes + all children once
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const [cls, ch] = await Promise.all([listActiveClasses(), listAllChildren()])
      setClasses(cls)
      setAllChildren(ch)
      if (cls.length > 0 && !selectedClassId) setSelectedClassId(cls[0].id)
      setIsLoading(false)
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load attendance records whenever class or date changes
  useEffect(() => {
    if (!selectedClassId) return
    const load = async () => {
      const list = await getAttendanceForClassDate(selectedClassId, date)
      const map = new Map<string, AttendanceStatus>()
      list.forEach((r) => map.set(r.child_id, r.status))
      setRecords(map)
    }
    void load()
  }, [selectedClassId, date])

  const childrenInClass = useMemo(
    () => allChildren.filter((c) => c.class_group_id === selectedClassId),
    [allChildren, selectedClassId],
  )

  const selectedClass = classes.find((c) => c.id === selectedClassId)

  const changeDate = (days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

  const cycleStatus = async (childId: string) => {
    if (!selectedClassId || !user) return
    const current = records.get(childId)
    const next: AttendanceStatus =
      current === undefined ? 'present' :
      current === 'present' ? 'absent' :
      current === 'absent' ? 'excused' :
      'present'

    // Optimistic update
    setRecords((prev) => new Map(prev).set(childId, next))
    setSavingChildId(childId)

    const { error } = await upsertAttendance(childId, selectedClassId, date, next, user.id)
    if (error) {
      // Revert on error
      setRecords((prev) => {
        const m = new Map(prev)
        if (current === undefined) m.delete(childId)
        else m.set(childId, current)
        return m
      })
    }
    setSavingChildId(null)
  }

  const stats = useMemo(() => {
    const present = Array.from(records.values()).filter((s) => s === 'present').length
    const absent = Array.from(records.values()).filter((s) => s === 'absent').length
    const excused = Array.from(records.values()).filter((s) => s === 'excused').length
    return { present, absent, excused, unmarked: childrenInClass.length - records.size }
  }, [records, childrenInClass.length])

  // Show today's weekday
  const isoDate = new Date(date)
  const weekday = isoDate.getDay()
  const trainingDay = weekday === 1 ? 'pazartesi' : weekday === 3 ? 'carsamba' : weekday === 5 ? 'cuma' : null

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        kicker="Antrenör Paneli"
        title="Yoklama"
        description="Grup ve tarih seçin, her öğrenciye dokunarak durumu güncelleyin."
      />


      {/* Controls */}
      <Card className="flex flex-col gap-4">
        {/* Date selector */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => changeDate(-1)} aria-label="Önceki gün">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 flex flex-col items-center">
            <p className="font-display font-bold text-title-md text-on-surface">
              {formatDateLong(date)}
            </p>
            <p className="text-body-sm text-on-surface/50">
              {trainingDay ? `${trainingDayLabels[trainingDay]} · Antrenman` : 'Antrenman günü değil'}
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

        {/* Class selector */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-low">
          <span className="text-label-md text-on-surface/80 font-medium">Grup</span>
          <div className="flex flex-wrap gap-2">
            {classes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={cn(
                  'px-3 py-2 rounded-lg text-body-sm font-semibold transition-colors',
                  selectedClassId === c.id
                    ? 'bg-primary text-white'
                    : 'bg-surface-low text-on-surface/70 hover:bg-surface-high'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats strip */}
      {!isLoading && selectedClass && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <StatTile label="Toplam" value={childrenInClass.length} variant="neutral" />
          <StatTile label="Geldi" value={stats.present} variant="success" />
          <StatTile label="Gelmedi" value={stats.absent} variant="danger" />
          <StatTile label="Mazeret" value={stats.excused} variant="warning" />
        </div>
      )}

      {/* Student list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !selectedClass ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <CalendarDays className="w-10 h-10 text-on-surface/30" />
          <p className="font-display font-bold text-title-lg text-on-surface">
            Önce bir grup seçin
          </p>
        </Card>
      ) : childrenInClass.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <UsersIcon className="w-10 h-10 text-on-surface/30" />
          <p className="font-display font-bold text-title-lg text-on-surface">
            Bu grupta öğrenci yok
          </p>
          <p className="text-body-md text-on-surface/60">
            Veliler çocuklarını bu gruba atadığında burada görünecek.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex items-start gap-2.5 bg-surface-low rounded-md px-3 py-2.5">
            <Info className="w-4 h-4 text-on-surface/40 shrink-0 mt-0.5" />
            <p className="text-body-sm text-on-surface/60 leading-relaxed">
              Her öğrenciye dokunarak durumu değiştirin: <strong>Geldi → Gelmedi → Mazeretli</strong>.
              Değişiklikler otomatik kaydedilir.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {childrenInClass.map((child) => {
              const status = records.get(child.id)
              return (
                <AttendanceRow
                  key={child.id}
                  name={child.full_name}
                  avatarUrl={child.avatar_url}
                  status={status}
                  isSaving={savingChildId === child.id}
                  onTap={() => cycleStatus(child.id)}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Stat tile ───────────────────────────────────────────────────────────────

interface StatTileProps {
  label: string
  value: number
  variant: 'neutral' | 'success' | 'danger' | 'warning'
}

function StatTile({ label, value, variant }: StatTileProps) {
  const classes = {
    neutral: 'bg-surface-card text-on-surface',
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-primary',
    warning: 'bg-yellow-50 text-yellow-700',
  }[variant]

  return (
    <div className={cn('rounded-lg py-3 px-2 shadow-ambient', classes)}>
      <p className="font-display font-black text-2xl leading-none">{value}</p>
      <p className="text-label-sm uppercase tracking-widest mt-1 opacity-80">{label}</p>
    </div>
  )
}

// ─── Attendance row ─────────────────────────────────────────────────────────

interface AttendanceRowProps {
  name: string
  avatarUrl: string | null
  status: AttendanceStatus | undefined
  isSaving: boolean
  onTap: () => void
}

function AttendanceRow({ name, avatarUrl, status, isSaving, onTap }: AttendanceRowProps) {
  const statusConfig = status
    ? {
        present: {
          bg: 'bg-green-50 border-green-500',
          icon: Check,
          iconColor: 'text-green-600',
          label: ATTENDANCE_LABELS.present,
        },
        absent: {
          bg: 'bg-red-50 border-primary',
          icon: X,
          iconColor: 'text-primary',
          label: ATTENDANCE_LABELS.absent,
        },
        excused: {
          bg: 'bg-yellow-50 border-yellow-500',
          icon: Info,
          iconColor: 'text-yellow-700',
          label: ATTENDANCE_LABELS.excused,
        },
      }[status]
    : null

  return (
    <button
      onClick={onTap}
      disabled={isSaving}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-150 min-h-touch',
        'border-l-4 shadow-ambient',
        'active:scale-[0.99]',
        'focus-visible:outline-2 focus-visible:outline-primary',
        statusConfig ? statusConfig.bg : 'bg-surface-card border-transparent hover:bg-surface-low'
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

      <span className="flex-1 font-display font-semibold text-title-md text-on-surface truncate">
        {name}
      </span>

      {statusConfig ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-label-md uppercase tracking-widest font-semibold', statusConfig.iconColor)}>
            {statusConfig.label}
          </span>
          <div className={cn('w-8 h-8 rounded-full bg-white flex items-center justify-center', statusConfig.iconColor)}>
            <statusConfig.icon className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <span className="text-body-sm text-on-surface/40 shrink-0">Dokun →</span>
      )}
    </button>
  )
}

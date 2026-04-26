import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Info, Baby } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/dashboard'
import { useAuth } from '@/hooks/useAuth'
import { getMyChild, type Child } from '@/lib/children'
import {
  getChildAttendance,
  computeStats,
  ATTENDANCE_LABELS,
  type AttendanceRecord,
  type AttendanceStatus,
} from '@/lib/attendance'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Parent: view child's attendance history.
 * Shows summary stats + scrollable list of recent sessions.
 */
export function ParentAttendancePage() {
  const { user } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setIsLoading(true)
      const c = await getMyChild(user.id)
      setChild(c)
      if (c) {
        const list = await getChildAttendance(c.id)
        setRecords(list)
      }
      setIsLoading(false)
    }
    void load()
  }, [user])

  const stats = useMemo(() => computeStats(records), [records])

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        kicker="Veli Paneli"
        title="Devamsızlık"
        description="Çocuğunuzun antrenmanlara katılım geçmişi."
      />


      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !child ? (
        <NoChildCard />
      ) : (
        <>
          {/* Summary card */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                {child.avatar_url ? (
                  <img src={child.avatar_url} alt={child.full_name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span className="font-display font-black text-white text-base">
                    {child.full_name[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">Öğrenci</p>
                <h2 className="font-display font-bold text-title-lg text-on-surface">
                  {child.full_name}
                </h2>
              </div>
              {stats.total > 0 && (
                <div className="text-right">
                  <p className="font-display font-black text-3xl text-primary leading-none">
                    %{stats.presentRate}
                  </p>
                  <p className="text-label-sm text-on-surface/40 uppercase tracking-widest mt-0.5">
                    Katılım
                  </p>
                </div>
              )}
            </div>

            {stats.total > 0 ? (
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-surface-low">
                <StatTile label="Geldi" value={stats.present} variant="success" />
                <StatTile label="Gelmedi" value={stats.absent} variant="danger" />
                <StatTile label="Mazeret" value={stats.excused} variant="warning" />
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-surface-low rounded-md px-3 py-2.5">
                <Info className="w-4 h-4 text-on-surface/40 shrink-0 mt-0.5" />
                <p className="text-body-sm text-on-surface/60">
                  Henüz yoklama kaydı yok. Antrenmanlardan sonra antrenör yoklamayı işaretleyecek.
                </p>
              </div>
            )}
          </Card>

          {/* Records list */}
          {records.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-label-md uppercase tracking-widest text-on-surface/50 px-1">
                Son Kayıtlar ({records.length})
              </h3>
              <div className="flex flex-col gap-2">
                {records.map((r) => (
                  <AttendanceRecordRow key={r.id} record={r} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function NoChildCard() {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
        <Baby className="w-7 h-7 text-on-surface/40" />
      </div>
      <p className="font-display font-bold text-title-lg text-on-surface">
        Önce çocuğunuzu kaydedin
      </p>
      <p className="text-body-md text-on-surface/60 max-w-sm">
        Devamsızlık kayıtlarını görmek için önce çocuğunuzun profilini oluşturmanız gerekir.
      </p>
      <Link to="/veli/cocugum">
        <Button variant="primary" size="md">
          Çocuğumu Kaydet
        </Button>
      </Link>
    </Card>
  )
}

// ─── Mini stat tile ──────────────────────────────────────────────────────────

interface StatTileProps {
  label: string
  value: number
  variant: 'success' | 'danger' | 'warning'
}

function StatTile({ label, value, variant }: StatTileProps) {
  const classes = {
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-primary',
    warning: 'bg-yellow-50 text-yellow-700',
  }[variant]

  return (
    <div className={cn('rounded-lg py-3 px-2 text-center', classes)}>
      <p className="font-display font-black text-xl leading-none">{value}</p>
      <p className="text-label-sm uppercase tracking-widest mt-1 opacity-80">{label}</p>
    </div>
  )
}

// ─── Record row ──────────────────────────────────────────────────────────────

function AttendanceRecordRow({ record }: { record: AttendanceRecord }) {
  const config: Record<
    AttendanceStatus,
    { bg: string; icon: typeof Check; iconColor: string; border: string }
  > = {
    present: {
      bg: 'bg-green-50',
      icon: Check,
      iconColor: 'text-green-600',
      border: 'border-green-500',
    },
    absent: {
      bg: 'bg-red-50',
      icon: X,
      iconColor: 'text-primary',
      border: 'border-primary',
    },
    excused: {
      bg: 'bg-yellow-50',
      icon: Info,
      iconColor: 'text-yellow-700',
      border: 'border-yellow-500',
    },
  }

  const c = config[record.status]

  return (
    <div className={cn('flex items-center gap-3 rounded-lg p-3 border-l-4 shadow-ambient', c.bg, c.border)}>
      <div className={cn('w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0', c.iconColor)}>
        <c.icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-body-md text-on-surface">
          {formatDateLong(record.date)}
        </p>
        {record.notes && (
          <p className="text-body-sm text-on-surface/60 mt-0.5">{record.notes}</p>
        )}
      </div>
      <Badge variant={record.status === 'present' ? 'success' : record.status === 'absent' ? 'error' : 'warning'}>
        {ATTENDANCE_LABELS[record.status]}
      </Badge>
    </div>
  )
}


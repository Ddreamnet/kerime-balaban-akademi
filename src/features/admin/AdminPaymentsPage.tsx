import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CreditCard,
  Check,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  History,
  MessageCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import {
  listPaymentsForPeriod,
  listPaymentsForChild,
  upsertPayment,
  currentPeriod,
  formatPeriod,
  PAYMENT_STATUS_LABELS,
  TURKISH_MONTHS,
  type PaymentRecord,
  type PaymentStatus,
} from '@/lib/payments'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDateLong, whatsappUrl } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Admin: Payments — monthly fee tracking.
 * Default view: current month grid (all children + their status).
 * Clicking a child opens payment history modal with full CRUD.
 */
export function AdminPaymentsPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<ChildWithParent[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState(currentPeriod())
  const [selectedChild, setSelectedChild] = useState<ChildWithParent | null>(null)
  const [actioningChildId, setActioningChildId] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    const [ch, pays] = await Promise.all([
      listAllChildren(),
      listPaymentsForPeriod(period.month, period.year),
    ])
    setChildren(ch)
    setPayments(pays)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.month, period.year])

  const paymentByChild = useMemo(() => {
    const m = new Map<string, PaymentRecord>()
    payments.forEach((p) => m.set(p.child_id, p))
    return m
  }, [payments])

  const counts = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'paid').length
    const unpaid = payments.filter((p) => p.status === 'unpaid').length
    const late = payments.filter((p) => p.status === 'late').length
    const unmarked = children.length - payments.length
    return { paid, unpaid, late, unmarked }
  }, [payments, children.length])

  const changePeriod = (delta: number) => {
    let newMonth = period.month + delta
    let newYear = period.year
    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    } else if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }
    setPeriod({ month: newMonth, year: newYear })
  }

  const quickMarkPaid = async (childId: string) => {
    if (!user) return
    setActioningChildId(childId)
    const { error } = await upsertPayment({
      childId,
      month: period.month,
      year: period.year,
      status: 'paid',
      paidByAdminId: user.id,
    })
    if (!error) await load()
    setActioningChildId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">Ödemeler</h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          Aylık aidat takibi ve geçmiş ödeme kayıtları.
        </p>
      </div>

      {/* Period selector */}
      <Card className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => changePeriod(-1)} aria-label="Önceki ay">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 flex flex-col items-center">
          <p className="font-display font-bold text-headline-sm text-on-surface">
            {formatPeriod(period.month, period.year)}
          </p>
          <p className="text-body-sm text-on-surface/50">
            {children.length} öğrenci · {payments.length} kayıt
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => changePeriod(1)} aria-label="Sonraki ay">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPeriod(currentPeriod())}
          className="text-body-sm"
        >
          Bu Aya Dön
        </Button>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Ödendi" value={counts.paid} variant="success" icon={Check} />
        <StatCard label="Gecikmiş" value={counts.late} variant="danger" icon={AlertTriangle} />
        <StatCard label="Ödenmedi" value={counts.unpaid} variant="warning" icon={Clock} />
        <StatCard label="İşaretsiz" value={counts.unmarked} variant="neutral" icon={CreditCard} />
      </div>

      {/* Student rows */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : children.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <CreditCard className="w-10 h-10 text-on-surface/30" />
          <p className="font-display font-bold text-title-lg text-on-surface">
            Henüz öğrenci yok
          </p>
          <p className="text-body-md text-on-surface/60">
            Veliler çocuklarını kaydettikçe burada listelenecekler.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {children.map((c) => {
            const payment = paymentByChild.get(c.id)
            return (
              <PaymentRow
                key={c.id}
                child={c}
                payment={payment}
                isActioning={actioningChildId === c.id}
                onQuickPaid={() => quickMarkPaid(c.id)}
                onOpenHistory={() => setSelectedChild(c)}
              />
            )
          })}
        </div>
      )}

      {/* History modal */}
      {selectedChild && (
        <PaymentHistoryModal
          child={selectedChild}
          isOpen={selectedChild !== null}
          onClose={() => setSelectedChild(null)}
          onChanged={() => load()}
        />
      )}
    </div>
  )
}

// ─── Stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number
  variant: 'success' | 'danger' | 'warning' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
}

function StatCard({ label, value, variant, icon: Icon }: StatCardProps) {
  const classes = {
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-primary',
    warning: 'bg-yellow-50 text-yellow-700',
    neutral: 'bg-surface-low text-on-surface/60',
  }[variant]

  return (
    <Card padding="sm" className={cn('flex items-center gap-3', classes)}>
      <Icon className="w-6 h-6 opacity-80 shrink-0" />
      <div>
        <p className="font-display font-black text-2xl leading-none">{value}</p>
        <p className="text-label-sm uppercase tracking-widest opacity-70 mt-0.5">{label}</p>
      </div>
    </Card>
  )
}

// ─── Payment row ─────────────────────────────────────────────────────────────

interface PaymentRowProps {
  child: ChildWithParent
  payment: PaymentRecord | undefined
  isActioning: boolean
  onQuickPaid: () => void
  onOpenHistory: () => void
}

function PaymentRow({
  child,
  payment,
  isActioning,
  onQuickPaid,
  onOpenHistory,
}: PaymentRowProps) {
  const status = payment?.status
  const statusColors = {
    paid: 'border-l-green-500 bg-green-50/50',
    late: 'border-l-primary bg-red-50/50',
    unpaid: 'border-l-yellow-500 bg-yellow-50/50',
  }

  const whatsappMessage = payment
    ? `Merhaba ${child.parent_name}, ${child.full_name} için ${formatPeriod(payment.period_month, payment.period_year)} ödemesi hatırlatması.`
    : ''

  return (
    <Card
      padding="sm"
      className={cn(
        'flex flex-col md:flex-row md:items-center gap-3 border-l-4',
        status ? statusColors[status] : 'border-l-transparent',
      )}
    >
      {/* Child + parent */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
          {child.avatar_url ? (
            <img src={child.avatar_url} alt={child.full_name} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <span className="font-display font-black text-white text-sm">
              {child.full_name[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-title-md text-on-surface truncate">
            {child.full_name}
          </h3>
          <p className="text-body-sm text-on-surface/50 truncate">
            {child.parent_name} · {child.parent_phone ?? 'Telefon yok'}
          </p>
        </div>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2 md:shrink-0">
        {status ? (
          <Badge
            variant={status === 'paid' ? 'success' : status === 'late' ? 'error' : 'warning'}
          >
            {PAYMENT_STATUS_LABELS[status]}
            {payment?.amount && ` · ${formatCurrency(payment.amount)}`}
          </Badge>
        ) : (
          <Badge variant="default">İşaretlenmedi</Badge>
        )}
        {status !== 'paid' && (
          <Button
            variant="primary"
            size="sm"
            onClick={onQuickPaid}
            loading={isActioning}
          >
            <Check className="w-4 h-4" />
            Ödendi
          </Button>
        )}
        {status !== 'paid' && child.parent_phone && (
          <a
            href={whatsappUrl(child.parent_phone, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp ile hatırlat"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        )}
        <Button variant="ghost" size="sm" onClick={onOpenHistory} aria-label="Geçmişi gör">
          <History className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}

// ─── Payment history modal ──────────────────────────────────────────────────

interface HistoryModalProps {
  child: ChildWithParent
  isOpen: boolean
  onClose: () => void
  onChanged: () => void
}

interface PeriodFormValues {
  status: PaymentStatus
  amount: string
  note: string
}

function PaymentHistoryModal({ child, isOpen, onClose, onChanged }: HistoryModalProps) {
  const { user } = useAuth()
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPeriod, setEditingPeriod] = useState<{ month: number; year: number } | null>(
    null,
  )

  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      setIsLoading(true)
      const list = await listPaymentsForChild(child.id)
      setRecords(list)
      setIsLoading(false)
    }
    void load()
  }, [isOpen, child.id])

  const existingForEditing = editingPeriod
    ? records.find(
        (r) => r.period_month === editingPeriod.month && r.period_year === editingPeriod.year,
      ) ?? null
    : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${child.full_name} — Ödeme Geçmişi`} size="lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : editingPeriod ? (
        <EditPeriodForm
          childId={child.id}
          month={editingPeriod.month}
          year={editingPeriod.year}
          existing={existingForEditing}
          adminId={user?.id ?? null}
          onSaved={async () => {
            const list = await listPaymentsForChild(child.id)
            setRecords(list)
            onChanged()
            setEditingPeriod(null)
          }}
          onCancel={() => setEditingPeriod(null)}
        />
      ) : (
        <PeriodList
          records={records}
          onEdit={(month, year) => setEditingPeriod({ month, year })}
        />
      )}
    </Modal>
  )
}

// ─── Period list ─────────────────────────────────────────────────────────────

function PeriodList({
  records,
  onEdit,
}: {
  records: PaymentRecord[]
  onEdit: (month: number, year: number) => void
}) {
  // Show last 12 months, skipping future periods
  const now = currentPeriod()
  const periods: { month: number; year: number }[] = []
  let m = now.month
  let y = now.year
  for (let i = 0; i < 12; i++) {
    periods.push({ month: m, year: y })
    m -= 1
    if (m < 1) {
      m = 12
      y -= 1
    }
  }

  const recordByPeriod = new Map<string, PaymentRecord>()
  records.forEach((r) => recordByPeriod.set(`${r.period_year}-${r.period_month}`, r))

  return (
    <div className="flex flex-col gap-2">
      {periods.map(({ month, year }) => {
        const record = recordByPeriod.get(`${year}-${month}`)
        return (
          <button
            key={`${year}-${month}`}
            onClick={() => onEdit(month, year)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
              'hover:bg-surface-low focus-visible:outline-2 focus-visible:outline-primary',
              record?.status === 'paid' && 'bg-green-50/50',
              record?.status === 'late' && 'bg-red-50/50',
              record?.status === 'unpaid' && 'bg-yellow-50/50',
              !record && 'bg-surface-low',
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-body-md text-on-surface">
                {TURKISH_MONTHS[month - 1]} {year}
              </p>
              {record?.paid_at && (
                <p className="text-body-sm text-on-surface/50">
                  Ödeme: {formatDateLong(record.paid_at)}
                </p>
              )}
              {record?.note && (
                <p className="text-body-sm text-on-surface/50 italic mt-0.5">{record.note}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {record?.amount !== undefined && record?.amount !== null && (
                <span className="text-body-sm font-semibold text-on-surface">
                  {formatCurrency(record.amount)}
                </span>
              )}
              {record ? (
                <Badge
                  variant={
                    record.status === 'paid'
                      ? 'success'
                      : record.status === 'late'
                        ? 'error'
                        : 'warning'
                  }
                >
                  {PAYMENT_STATUS_LABELS[record.status]}
                </Badge>
              ) : (
                <Badge variant="default">İşaretlenmedi</Badge>
              )}
              <Pencil className="w-4 h-4 text-on-surface/40" />
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Edit period form ───────────────────────────────────────────────────────

interface EditPeriodFormProps {
  childId: string
  month: number
  year: number
  existing: PaymentRecord | null
  adminId: string | null
  onSaved: () => void
  onCancel: () => void
}

function EditPeriodForm({
  childId,
  month,
  year,
  existing,
  adminId,
  onSaved,
  onCancel,
}: EditPeriodFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PeriodFormValues>({
    defaultValues: {
      status: existing?.status ?? 'unpaid',
      amount: existing?.amount?.toString() ?? '',
      note: existing?.note ?? '',
    },
  })

  const selectedStatus = watch('status')

  const onSubmit = async (data: PeriodFormValues) => {
    const amountNum = data.amount.trim() === '' ? null : Number(data.amount)
    if (amountNum !== null && (isNaN(amountNum) || amountNum < 0)) {
      setError('amount', { message: 'Geçerli bir tutar girin.' })
      return
    }

    const { error } = await upsertPayment({
      childId,
      month,
      year,
      status: data.status,
      amount: amountNum,
      note: data.note.trim() || null,
      paidByAdminId: adminId,
    })

    if (error) {
      setError('root', { message: error })
      return
    }

    onSaved()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="bg-primary-container rounded-md px-3 py-2">
        <p className="font-display font-semibold text-body-md text-primary">
          {TURKISH_MONTHS[month - 1]} {year}
        </p>
      </div>

      {/* Status chips */}
      <div className="flex flex-col gap-2">
        <span className="text-label-md text-on-surface/80 font-medium">Durum</span>
        <div className="grid grid-cols-3 gap-2">
          {(['paid', 'unpaid', 'late'] as PaymentStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue('status', s)}
              className={cn(
                'px-3 py-2.5 rounded-lg text-body-sm font-semibold transition-colors',
                selectedStatus === s && s === 'paid' && 'bg-green-600 text-white',
                selectedStatus === s && s === 'unpaid' && 'bg-yellow-600 text-white',
                selectedStatus === s && s === 'late' && 'bg-primary text-white',
                selectedStatus !== s && 'bg-surface-low text-on-surface/60 hover:bg-surface-high',
              )}
            >
              {PAYMENT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Tutar (TL, opsiyonel)"
        type="number"
        min={0}
        step={0.01}
        placeholder="Örn. 800"
        error={errors.amount?.message}
        {...register('amount')}
      />

      <Textarea
        label="Not (opsiyonel)"
        rows={2}
        placeholder="Ödeme şekli, hatırlatma notu..."
        {...register('note')}
      />

      {errors.root && (
        <p className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2" role="alert">
          {errors.root.message}
        </p>
      )}

      <div className="flex gap-2 mt-2">
        <Button type="button" variant="ghost" size="md" onClick={onCancel} className="flex-1">
          İptal
        </Button>
        <Button type="submit" variant="primary" size="md" loading={isSubmitting} className="flex-1">
          Kaydet
        </Button>
      </div>
    </form>
  )
}

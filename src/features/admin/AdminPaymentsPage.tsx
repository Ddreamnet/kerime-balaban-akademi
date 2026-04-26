import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  MessageCircle,
  Search,
  Wallet,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, StatCard, EmptyState } from '@/components/dashboard'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import {
  listPaymentsDueBetween,
  updatePaymentById,
  derivePaymentStatus,
  daysUntilDue,
  formatPeriodRange,
  formatDate,
  DERIVED_PAYMENT_STATUS_LABELS,
  type PaymentRecord,
  type DerivedPaymentStatus,
} from '@/lib/payments'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, whatsappUrl } from '@/utils/format'
import { cn } from '@/utils/cn'

type FilterStatus = 'all' | 'pending' | 'overdue' | 'paid'
type RangePreset = 'week' | 'month' | 'quarter'

interface RowData {
  payment: PaymentRecord
  child: ChildWithParent
  derived: DerivedPaymentStatus
  daysUntil: number
}

const RANGE_LABELS: Record<RangePreset, string> = {
  week: 'Bu Hafta',
  month: 'Bu Ay',
  quarter: 'Önümüzdeki 3 Ay',
}

/**
 * Admin: Payments — per-child billing cycles.
 *
 * Default view: payments with due_date in the next month, sorted by due_date.
 * Each row carries the student, period range, due date, amount, and a
 * one-click "Ödendi" action. Quick filters narrow by status and time window.
 */
export function AdminPaymentsPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<ChildWithParent[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [range, setRange] = useState<RangePreset>('month')
  const [search, setSearch] = useState('')
  const [actioningId, setActioningId] = useState<string | null>(null)
  // Edit popover state — single row at a time.
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')

  const todayIso = new Date().toISOString().slice(0, 10)
  const rangeEndIso = useMemo(() => {
    const d = new Date()
    if (range === 'week') d.setDate(d.getDate() + 7)
    else if (range === 'month') d.setDate(d.getDate() + 30)
    else d.setDate(d.getDate() + 90)
    return d.toISOString().slice(0, 10)
  }, [range])

  // Fetch in parallel: children (for parent join) and payments in window.
  // We also fetch overdue rows separately so the "Geciken" pill is correct
  // regardless of the selected forward window.
  const load = async () => {
    setIsLoading(true)
    const [ch, futurePays, overduePays] = await Promise.all([
      listAllChildren(),
      listPaymentsDueBetween(todayIso, rangeEndIso),
      // Overdue: due in the past 90 days, not paid.
      listPaymentsDueBetween(
        new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10),
        new Date(Date.now() - 86_400_000).toISOString().slice(0, 10),
      ),
    ])
    // Merge, dedupe by payment id.
    const merged = new Map<string, PaymentRecord>()
    futurePays.forEach((p) => merged.set(p.id, p))
    overduePays.forEach((p) => {
      if (p.status !== 'paid') merged.set(p.id, p)
    })
    setChildren(ch)
    setPayments(Array.from(merged.values()))
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const childById = useMemo(() => {
    const m = new Map<string, ChildWithParent>()
    children.forEach((c) => m.set(c.id, c))
    return m
  }, [children])

  const rows: RowData[] = useMemo(() => {
    const now = new Date()
    return payments
      .map((p) => {
        const child = childById.get(p.child_id)
        if (!child) return null
        return {
          payment: p,
          child,
          derived: derivePaymentStatus(p, now),
          daysUntil: daysUntilDue(p.due_date, now),
        }
      })
      .filter((r): r is RowData => r !== null)
      .sort((a, b) => {
        // Overdue first, then ascending due date.
        if (a.derived === 'overdue' && b.derived !== 'overdue') return -1
        if (a.derived !== 'overdue' && b.derived === 'overdue') return 1
        return a.payment.due_date.localeCompare(b.payment.due_date)
      })
  }, [payments, childById])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (filterStatus !== 'all' && r.derived !== filterStatus) return false
      if (q && !r.child.full_name.toLowerCase().includes(q)) return false
      return true
    })
  }, [rows, filterStatus, search])

  const counts = useMemo(() => {
    const overdue = rows.filter((r) => r.derived === 'overdue').length
    const pending = rows.filter((r) => r.derived === 'pending').length
    const paid = rows.filter((r) => r.derived === 'paid').length
    const dueThisWeek = rows.filter(
      (r) => r.derived === 'pending' && r.daysUntil >= 0 && r.daysUntil <= 7,
    ).length
    return { overdue, pending, paid, dueThisWeek }
  }, [rows])

  const handleMarkPaid = async (row: RowData, amount?: number | null) => {
    if (!user) return
    setActioningId(row.payment.id)
    const { record, error } = await updatePaymentById({
      id: row.payment.id,
      status: 'paid',
      amount: amount ?? row.payment.amount,
      paidByAdminId: user.id,
    })
    setActioningId(null)
    setEditingPaymentId(null)
    if (error || !record) {
      alert(`Kayıt başarısız: ${error ?? 'Bilinmeyen hata.'}`)
      return
    }
    setPayments((prev) => prev.map((p) => (p.id === record.id ? record : p)))
  }

  const handleUndoPaid = async (row: RowData) => {
    if (!confirm('Ödendi işareti kaldırılsın mı?')) return
    setActioningId(row.payment.id)
    const { record, error } = await updatePaymentById({
      id: row.payment.id,
      status: 'unpaid',
    })
    setActioningId(null)
    if (error || !record) {
      alert(`Kayıt başarısız: ${error ?? 'Bilinmeyen hata.'}`)
      return
    }
    setPayments((prev) => prev.map((p) => (p.id === record.id ? record : p)))
  }

  const startEdit = (row: RowData) => {
    setEditingPaymentId(row.payment.id)
    setEditAmount(row.payment.amount != null ? String(row.payment.amount) : '')
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Ödemeler"
        description="Vadesi yaklaşan ve geciken ödemeler. Her öğrencinin kendi aylık döngüsü vardır."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={AlertTriangle} label="Geciken" value={counts.overdue} tone="danger" />
        <StatCard icon={Calendar} label="Bu Hafta" value={counts.dueThisWeek} tone="warning" />
        <StatCard icon={Wallet} label="Bekleyen" value={counts.pending} tone="neutral" />
        <StatCard icon={Check} label="Ödenen" value={counts.paid} tone="success" />
      </div>

      {/* Range picker */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-body-sm text-on-surface/60">Aralık:</span>
        {(['week', 'month', 'quarter'] as RangePreset[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              'px-3 h-9 rounded-md text-body-sm font-semibold transition-colors',
              range === r
                ? 'bg-primary text-white'
                : 'bg-surface-low text-on-surface/70 hover:bg-surface-high',
            )}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-2">
          {(['all', 'overdue', 'pending', 'paid'] as FilterStatus[]).map((s) => {
            const label = s === 'all' ? 'Hepsi' : DERIVED_PAYMENT_STATUS_LABELS[s]
            const c =
              s === 'all'
                ? rows.length
                : s === 'overdue'
                  ? counts.overdue
                  : s === 'pending'
                    ? counts.pending
                    : counts.paid
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'px-3 h-9 rounded-md text-body-sm font-semibold transition-colors flex items-center gap-1.5',
                  filterStatus === s
                    ? 'bg-on-surface text-white'
                    : 'bg-surface-low text-on-surface/70 hover:bg-surface-high',
                )}
              >
                {label}
                <span className="opacity-60">({c})</span>
              </button>
            )
          })}
        </div>

        <div className="ml-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40" />
          <Input
            placeholder="Öğrenci ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 max-w-xs"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Bu aralıkta gösterilecek ödeme yok"
          description="Aralığı genişletmeyi veya filtreleri temizlemeyi deneyin."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((row) => (
            <PaymentRowCard
              key={row.payment.id}
              row={row}
              isActioning={actioningId === row.payment.id}
              onUndoPaid={() => handleUndoPaid(row)}
              onStartEdit={() => startEdit(row)}
              isEditing={editingPaymentId === row.payment.id}
              editAmount={editAmount}
              onEditAmountChange={setEditAmount}
              onConfirmEdit={() => {
                const parsed = editAmount ? Number(editAmount) : null
                if (parsed !== null && Number.isNaN(parsed)) {
                  alert('Geçerli bir tutar girin.')
                  return
                }
                handleMarkPaid(row, parsed)
              }}
              onCancelEdit={() => setEditingPaymentId(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentRowCard({
  row,
  isActioning,
  onUndoPaid,
  onStartEdit,
  isEditing,
  editAmount,
  onEditAmountChange,
  onConfirmEdit,
  onCancelEdit,
}: {
  row: RowData
  isActioning: boolean
  onUndoPaid: () => void
  onStartEdit: () => void
  isEditing: boolean
  editAmount: string
  onEditAmountChange: (v: string) => void
  onConfirmEdit: () => void
  onCancelEdit: () => void
}) {
  const { payment, child, derived, daysUntil } = row

  const whatsapp = child.parent_phone
    ? whatsappUrl(
        child.parent_phone,
        `Merhaba ${child.parent_name}, ${child.full_name} için ${formatPeriodRange(payment.period_start, payment.period_end)} dönemine ait ${formatDate(payment.due_date)} vadeli ödeme hatırlatması.`,
      )
    : null

  const dueLabel = (() => {
    if (derived === 'paid') return `Ödendi · ${payment.paid_at ? formatDate(payment.paid_at) : ''}`
    if (derived === 'overdue') return `${Math.abs(daysUntil)} gün gecikmiş`
    if (daysUntil === 0) return 'Bugün vade'
    if (daysUntil === 1) return 'Yarın vade'
    return `${daysUntil} gün kaldı`
  })()

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link
          to={`/admin/ogrenci/${child.id}`}
          className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 overflow-hidden"
        >
          {child.avatar_url ? (
            <img
              src={child.avatar_url}
              alt={child.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display font-black text-white text-lg">
              {child.full_name[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </Link>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <Link
              to={`/admin/ogrenci/${child.id}`}
              className="font-display font-bold text-title-md text-on-surface hover:text-primary transition-colors"
            >
              {child.full_name}
            </Link>
            <StatusBadge derived={derived} />
          </div>
          <p className="text-body-sm text-on-surface/60 mt-0.5">
            {formatPeriodRange(payment.period_start, payment.period_end)}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-body-sm">
            <span
              className={cn(
                'font-semibold',
                derived === 'overdue' ? 'text-primary' : 'text-on-surface/70',
              )}
            >
              Vade: {formatDate(payment.due_date)}
            </span>
            <span className="text-on-surface/45">·</span>
            <span
              className={cn(
                derived === 'overdue'
                  ? 'text-primary font-semibold'
                  : 'text-on-surface/55',
              )}
            >
              {dueLabel}
            </span>
            {payment.amount !== null && (
              <>
                <span className="text-on-surface/45">·</span>
                <span className="font-semibold text-on-surface">
                  {formatCurrency(payment.amount)}
                </span>
              </>
            )}
          </div>
          <p className="text-body-sm text-on-surface/45 mt-0.5 truncate">
            Veli: {child.parent_name}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-on-surface/25 mt-2 shrink-0" />
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex flex-wrap gap-2 pl-14">
          {derived !== 'paid' ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onStartEdit}
                disabled={isActioning}
              >
                <Check className="w-4 h-4" />
                Ödendi İşaretle
              </Button>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-body-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Hatırlat
                </a>
              )}
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndoPaid}
              disabled={isActioning}
            >
              Ödendi İşaretini Kaldır
            </Button>
          )}
        </div>
      )}

      {isEditing && (
        <div className="flex flex-wrap items-end gap-2 pl-14 pt-1 border-t border-surface-low pt-3">
          <div className="flex flex-col gap-1">
            <label className="text-label-sm text-on-surface/60 uppercase tracking-wider">
              Tutar (TL)
            </label>
            <Input
              type="number"
              min={0}
              step="any"
              value={editAmount}
              onChange={(e) => onEditAmountChange(e.target.value)}
              placeholder="Boş bırakılabilir"
              className="w-44 h-10"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirmEdit}
            loading={isActioning}
          >
            Kaydet
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelEdit}
            disabled={isActioning}
          >
            İptal
          </Button>
        </div>
      )}
    </Card>
  )
}

function StatusBadge({ derived }: { derived: DerivedPaymentStatus }) {
  if (derived === 'paid') {
    return <Badge variant="success">{DERIVED_PAYMENT_STATUS_LABELS.paid}</Badge>
  }
  if (derived === 'overdue') {
    return <Badge variant="primary">{DERIVED_PAYMENT_STATUS_LABELS.overdue}</Badge>
  }
  return <Badge variant="default">{DERIVED_PAYMENT_STATUS_LABELS.pending}</Badge>
}

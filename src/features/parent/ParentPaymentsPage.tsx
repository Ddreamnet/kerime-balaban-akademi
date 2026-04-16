import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  Check,
  AlertTriangle,
  Clock,
  MessageCircle,
  Baby,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { getMyChild, type Child } from '@/lib/children'
import {
  listPaymentsForChild,
  currentPeriod,
  formatPeriod,
  computePaymentSummary,
  PAYMENT_STATUS_LABELS,
  TURKISH_MONTHS,
  type PaymentRecord,
  type PaymentStatus,
} from '@/lib/payments'
import { academyInfo, contactLinks } from '@/data/academyInfo'
import { formatCurrency, formatDateLong, whatsappUrl } from '@/utils/format'
import { cn } from '@/utils/cn'

export function ParentPaymentsPage() {
  const { user } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setIsLoading(true)
      const c = await getMyChild(user.id)
      setChild(c)
      if (c) {
        const list = await listPaymentsForChild(c.id)
        setRecords(list)
      }
      setIsLoading(false)
    }
    void load()
  }, [user])

  const summary = useMemo(() => computePaymentSummary(records), [records])

  const { month: currentMonth, year: currentYear } = currentPeriod()
  const currentStatus = useMemo(() => {
    return records.find(
      (r) => r.period_month === currentMonth && r.period_year === currentYear,
    )
  }, [records, currentMonth, currentYear])

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Veli Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">Ödemeler</h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          Aidat ödeme durumu ve geçmişi.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !child ? (
        <NoChildCard />
      ) : (
        <>
          {/* Current month card */}
          <CurrentMonthCard
            status={currentStatus?.status}
            amount={currentStatus?.amount ?? null}
            month={currentMonth}
            year={currentYear}
          />

          {/* Summary */}
          {records.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <SummaryTile label="Ödenen" value={summary.paidMonths} variant="success" icon={Check} />
              <SummaryTile label="Gecikmiş" value={summary.lateMonths} variant="danger" icon={AlertTriangle} />
              <SummaryTile label="Ödenmedi" value={summary.unpaidMonths} variant="warning" icon={Clock} />
            </div>
          )}

          {/* History */}
          {records.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h3 className="text-label-md uppercase tracking-widest text-on-surface/50 px-1">
                Geçmiş ({records.length})
              </h3>
              <div className="flex flex-col gap-2">
                {records.map((r) => (
                  <PaymentRow key={r.id} record={r} />
                ))}
              </div>
            </div>
          ) : (
            <Card className="flex flex-col items-center gap-3 py-10 text-center">
              <CreditCard className="w-10 h-10 text-on-surface/30" />
              <p className="font-display font-bold text-title-lg text-on-surface">
                Henüz ödeme kaydı yok
              </p>
              <p className="text-body-md text-on-surface/60 max-w-sm">
                Yönetici ödemeleri işaretledikçe burada listelenecekler.
              </p>
            </Card>
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
        Ödeme takibi için önce çocuğunuzun profilini oluşturmanız gerekir.
      </p>
      <Link to="/veli/cocugum">
        <Button variant="primary" size="md">
          Çocuğumu Kaydet
        </Button>
      </Link>
    </Card>
  )
}

// ─── Current month spotlight ────────────────────────────────────────────────

interface CurrentMonthCardProps {
  status: PaymentStatus | undefined
  amount: number | null
  month: number
  year: number
}

function CurrentMonthCard({ status, amount, month, year }: CurrentMonthCardProps) {
  const whatsappHref = whatsappUrl(
    academyInfo.whatsapp,
    `Merhaba, ${formatPeriod(month, year)} ödemesi için bilgi almak istiyorum.`,
  )

  if (status === 'paid') {
    return (
      <Card className="bg-gradient-to-r from-green-600 to-green-500 text-white border-0">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Check className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-label-md uppercase tracking-widest text-white/70">
              {formatPeriod(month, year)}
            </p>
            <p className="font-display font-black text-headline-md leading-tight mt-0.5">
              Ödendi ✓
            </p>
            {amount !== null && (
              <p className="text-body-md text-white/80 mt-1">{formatCurrency(amount)}</p>
            )}
          </div>
        </div>
      </Card>
    )
  }

  if (status === 'late') {
    return (
      <Card className="bg-gradient-primary text-white border-0 shadow-primary-glow/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-label-md uppercase tracking-widest text-white/70">
              {formatPeriod(month, year)}
            </p>
            <p className="font-display font-black text-headline-md leading-tight mt-0.5">
              Gecikmiş Ödeme
            </p>
            <p className="text-body-md text-white/80 mt-1">
              Lütfen en kısa sürede akademiyle iletişime geçin.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-white text-primary font-semibold hover:scale-[1.02] transition-transform"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp ile İletişim
            </a>
          </div>
        </div>
      </Card>
    )
  }

  // unpaid or unmarked
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6 text-yellow-700" />
        </div>
        <div className="flex-1">
          <p className="text-label-md uppercase tracking-widest text-on-surface/40">
            {formatPeriod(month, year)}
          </p>
          <p className="font-display font-bold text-headline-sm text-on-surface mt-0.5">
            {status === 'unpaid' ? 'Henüz ödenmedi' : 'Durum işaretlenmemiş'}
          </p>
          <p className="text-body-md text-on-surface/60 mt-1">
            Ödeme bilgisi için akademiyle iletişime geçebilirsiniz.
          </p>
          <a
            href={contactLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-body-sm font-semibold"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </Card>
  )
}

// ─── Summary tile ────────────────────────────────────────────────────────────

interface SummaryTileProps {
  label: string
  value: number
  variant: 'success' | 'danger' | 'warning'
  icon: React.ComponentType<{ className?: string }>
}

function SummaryTile({ label, value, variant, icon: Icon }: SummaryTileProps) {
  const classes = {
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-primary',
    warning: 'bg-yellow-50 text-yellow-700',
  }[variant]

  return (
    <div className={cn('rounded-lg py-3 px-3 text-center shadow-ambient', classes)}>
      <Icon className="w-5 h-5 mx-auto mb-1 opacity-80" />
      <p className="font-display font-black text-xl leading-none">{value}</p>
      <p className="text-label-sm uppercase tracking-widest mt-1 opacity-80">{label}</p>
    </div>
  )
}

// ─── Payment row ─────────────────────────────────────────────────────────────

function PaymentRow({ record }: { record: PaymentRecord }) {
  const config = {
    paid: {
      icon: Check,
      color: 'text-green-600',
      border: 'border-green-500',
      bg: 'bg-green-50',
    },
    late: {
      icon: AlertTriangle,
      color: 'text-primary',
      border: 'border-primary',
      bg: 'bg-red-50',
    },
    unpaid: {
      icon: Clock,
      color: 'text-yellow-700',
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
    },
  }[record.status]

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg p-3 border-l-4 shadow-ambient',
        config.bg,
        config.border,
      )}
    >
      <div className={cn('w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0', config.color)}>
        <config.icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-body-md text-on-surface">
          {TURKISH_MONTHS[record.period_month - 1]} {record.period_year}
        </p>
        {record.status === 'paid' && record.paid_at && (
          <p className="text-body-sm text-on-surface/50">
            Ödeme: {formatDateLong(record.paid_at)}
          </p>
        )}
        {record.note && (
          <p className="text-body-sm text-on-surface/50 italic mt-0.5">{record.note}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {record.amount !== null && record.amount !== undefined && (
          <span className="text-body-sm font-semibold text-on-surface">
            {formatCurrency(record.amount)}
          </span>
        )}
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
      </div>
    </div>
  )
}

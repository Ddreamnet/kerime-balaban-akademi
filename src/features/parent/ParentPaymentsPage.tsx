import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  Check,
  AlertTriangle,
  Clock,
  MessageCircle,
  Baby,
  CalendarClock,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader, PanelCard } from '@/components/dashboard'
import { getMyChild, type Child } from '@/lib/children'
import {
  listPaymentsForChild,
  derivePaymentStatus,
  daysUntilDue,
  formatPeriodRange,
  formatPaymentLabel,
  formatDate,
  computePaymentSummary,
  DERIVED_PAYMENT_STATUS_LABELS,
  type PaymentRecord,
  type DerivedPaymentStatus,
} from '@/lib/payments'
import { supabase } from '@/lib/supabase'
import { getBranchById } from '@/lib/branches'
import { academyInfo, contactLinks } from '@/data/academyInfo'
import { formatCurrency, whatsappUrl } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Parent: Payments — per-child billing cycle view.
 *
 * Top: large "next due" spotlight card (or "all caught up" if nothing pending).
 * Then summary counts, then chronological history. Period labels show
 * "18 Mart → 17 Nisan" instead of a single calendar month.
 */
export function ParentPaymentsPage() {
  const { user } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [packageNumberMap, setPackageNumberMap] = useState<Map<string, number>>(new Map())
  const [billingModel, setBillingModel] = useState<'monthly' | 'package' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setIsLoading(true)
      const c = await getMyChild(user.id)
      setChild(c)
      if (c) {
        const [list, branch] = await Promise.all([
          listPaymentsForChild(c.id),
          getBranchById(c.branch_id),
        ])
        setRecords(list)
        setBillingModel(branch?.billing_model ?? null)

        // Paket numaralarını topla
        const packageIds = list
          .map((p) => p.package_id)
          .filter((id): id is string => id !== null)
        if (packageIds.length > 0) {
          const { data: pkgs } = await supabase
            .from('packages')
            .select('id, package_number')
            .in('id', packageIds)
          const m = new Map<string, number>()
          for (const row of (pkgs ?? []) as { id: string; package_number: number }[]) {
            m.set(row.id, row.package_number)
          }
          setPackageNumberMap(m)
        }
      }
      setIsLoading(false)
    }
    void load()
  }, [user])

  const labelFor = useMemo(
    () => (record: PaymentRecord): string => {
      const num = record.package_id ? packageNumberMap.get(record.package_id) ?? null : null
      return formatPaymentLabel(record, num)
    },
    [packageNumberMap],
  )

  // Görünür kayıtlar: geçmiş tüm ödemeler + bir sonraki yaklaşan ödeme.
  // İleride generate edilmiş aylar, kendinden önceki ödemenin vadesi geçene
  // kadar gizli kalır. Örn. vade 25 Mayıs ise 26 Mayıs itibariyle Haziran
  // satırı listeye düşer.
  const visibleRecords = useMemo(() => {
    if (records.length === 0) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMs = today.getTime()

    let nextUpcoming: PaymentRecord | null = null
    const past: PaymentRecord[] = []
    for (const r of records) {
      const due = new Date(r.due_date)
      due.setHours(0, 0, 0, 0)
      if (due.getTime() <= todayMs) {
        past.push(r)
      } else if (!nextUpcoming || r.due_date < nextUpcoming.due_date) {
        nextUpcoming = r
      }
    }
    // records `period_start` descending sıralı geliyor; past o sırayı koruyor.
    // nextUpcoming hepsinden yeni → en üstte.
    return nextUpcoming ? [nextUpcoming, ...past] : past
  }, [records])

  const summary = useMemo(() => computePaymentSummary(visibleRecords), [visibleRecords])

  // The "next due" card highlights the most urgent unpaid period:
  //   1. Earliest overdue, else
  //   2. Earliest pending (closest upcoming due date)
  const spotlight = useMemo(() => {
    const now = new Date()
    const unpaid = visibleRecords
      .filter((r) => derivePaymentStatus(r, now) !== 'paid')
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
    return unpaid[0] ?? null
  }, [visibleRecords])

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        kicker="Veli Paneli"
        title="Ödemeler"
        description="Aylık ödeme dönemi ve geçmişi."
      />


      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !child ? (
        <NoChildCard />
      ) : billingModel === 'monthly' && !child.billing_start_date ? (
        <NotConfiguredCard />
      ) : billingModel === 'package' && records.length === 0 ? (
        <NoPackageYetCard />
      ) : (
        <>
          {/* Spotlight: next due (or "all clear") */}
          {spotlight ? (
            <SpotlightCard record={spotlight} label={labelFor(spotlight)} />
          ) : (
            <AllClearCard />
          )}

          {/* Summary */}
          {visibleRecords.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <SummaryTile
                label="Ödenen"
                value={summary.paidCount}
                variant="success"
                icon={Check}
              />
              <SummaryTile
                label="Gecikmiş"
                value={summary.overdueCount}
                variant="danger"
                icon={AlertTriangle}
              />
              <SummaryTile
                label="Bekleyen"
                value={summary.pendingCount}
                variant="warning"
                icon={Clock}
              />
            </div>
          )}

          {/* History */}
          {visibleRecords.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h3 className="text-label-md uppercase tracking-widest text-on-surface/50 px-1">
                Geçmiş ({visibleRecords.length})
              </h3>
              <div className="flex flex-col gap-2">
                {visibleRecords.map((r) => (
                  <PaymentRow key={r.id} record={r} label={labelFor(r)} />
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
                Yönetici ödeme planınızı belirledikçe burada listelenecek.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// ─── Empty states ───────────────────────────────────────────────────────────

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

function NoPackageYetCard() {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <CreditCard className="w-10 h-10 text-on-surface/30" />
      <p className="font-display font-bold text-title-lg text-on-surface">
        Henüz paket başlatılmadı
      </p>
      <p className="text-body-md text-on-surface/60 max-w-md">
        İlk yoklama işaretlendiğinde antrenör tarafından otomatik bir paket başlatılır
        ve fatura burada görünür.
      </p>
    </Card>
  )
}

function NotConfiguredCard() {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
        <CalendarClock className="w-7 h-7 text-amber-700" />
      </div>
      <p className="font-display font-bold text-title-lg text-on-surface">
        Ödeme planı henüz oluşturulmadı
      </p>
      <p className="text-body-md text-on-surface/60 max-w-md">
        Akademi yönetimi başlangıç tarihinizi girince aylık ödeme dönemleriniz
        burada görünecek. Bilgi için iletişime geçebilirsiniz.
      </p>
      <a
        href={contactLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-body-sm font-semibold"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </a>
    </Card>
  )
}

function AllClearCard() {
  return (
    <PanelCard tone="elite" decorated padding="md">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Check className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="panel-kicker-inverted">Tüm Ödemeler Güncel</p>
          <p className="font-display font-black text-headline-md leading-tight mt-0.5 text-white">
            Bekleyen ödeme yok ✓
          </p>
          <p className="text-body-md text-white/85 mt-1">
            Bir sonraki ödeme dönemi açıldığında burada bilgilendirileceksiniz.
          </p>
        </div>
      </div>
    </PanelCard>
  )
}

// ─── Spotlight: next due ────────────────────────────────────────────────────

function SpotlightCard({ record, label }: { record: PaymentRecord; label: string }) {
  const derived = derivePaymentStatus(record)
  const days = daysUntilDue(record.due_date)

  const periodText = label || formatPeriodRange(record.period_start, record.period_end)
  const whatsappHref = whatsappUrl(
    academyInfo.whatsapp,
    `Merhaba, ${periodText} ödemesi için bilgi almak istiyorum.`,
  )

  if (derived === 'overdue') {
    return (
      <PanelCard tone="spotlight" decorated padding="md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="panel-kicker-inverted">
              {label || formatPeriodRange(record.period_start, record.period_end)}
            </p>
            <p className="font-display font-black text-headline-md leading-tight mt-0.5 text-white">
              {Math.abs(days)} gün geçti
            </p>
            <p className="text-body-md text-white/85 mt-1">
              Vade tarihi: {formatDate(record.due_date)}
              {record.amount !== null && (
                <> · {formatCurrency(record.amount)}</>
              )}
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
      </PanelCard>
    )
  }

  // pending — gradient driven by urgency. Inline arbitrary value avoids any
  // tailwind-merge collision with Card's default surface background.
  const urgent = days <= 3
  const gradientStyle: React.CSSProperties = {
    backgroundImage: urgent
      ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
      : 'linear-gradient(135deg, #4c56af 0%, #6e78d4 100%)',
  }

  return (
    <Card className="text-white" style={gradientStyle}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <CalendarClock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-label-md uppercase tracking-widest text-white/70">
            {label || formatPeriodRange(record.period_start, record.period_end)}
          </p>
          <p className="font-display font-black text-headline-md leading-tight mt-0.5">
            {days === 0
              ? 'Bugün vade'
              : days === 1
                ? 'Yarın vade'
                : `${days} gün kaldı`}
          </p>
          <p className="text-body-md text-white/85 mt-1">
            Vade tarihi: {formatDate(record.due_date)}
            {record.amount !== null && (
              <> · {formatCurrency(record.amount)}</>
            )}
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-white/15 text-white font-semibold hover:bg-white/25 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Bilgi Al
          </a>
        </div>
      </div>
    </Card>
  )
}

// ─── Summary tile ───────────────────────────────────────────────────────────

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

// ─── Payment row ────────────────────────────────────────────────────────────

function PaymentRow({ record, label }: { record: PaymentRecord; label: string }) {
  const derived = derivePaymentStatus(record)

  const config: Record<DerivedPaymentStatus, {
    icon: React.ComponentType<{ className?: string }>
    color: string
    border: string
    bg: string
    badge: 'success' | 'error' | 'warning' | 'default'
  }> = {
    paid: {
      icon: Check,
      color: 'text-green-600',
      border: 'border-green-500',
      bg: 'bg-green-50',
      badge: 'success',
    },
    overdue: {
      icon: AlertTriangle,
      color: 'text-primary',
      border: 'border-primary',
      bg: 'bg-red-50',
      badge: 'error',
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-700',
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
      badge: 'warning',
    },
  }

  const c = config[derived]

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg p-3 border-l-4 shadow-ambient',
        c.bg,
        c.border,
      )}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0',
          c.color,
        )}
      >
        <c.icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-body-md text-on-surface">
          {label || formatPeriodRange(record.period_start, record.period_end)}
        </p>
        <p className="text-body-sm text-on-surface/55">
          Vade: {formatDate(record.due_date)}
          {derived === 'paid' && record.paid_at && (
            <> · Ödeme: {formatDate(record.paid_at)}</>
          )}
        </p>
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
        <Badge variant={c.badge}>{DERIVED_PAYMENT_STATUS_LABELS[derived]}</Badge>
      </div>
    </div>
  )
}

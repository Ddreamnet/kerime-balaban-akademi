import { useEffect, useState } from 'react'
import {
  Bell,
  BellRing,
  Check,
  Cake,
  CreditCard,
  Award,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { PageHeader, EmptyState } from '@/components/dashboard'
import { useAuth } from '@/hooks/useAuth'
import {
  listMyNotifications,
  markAsRead,
  markAllAsRead,
  NOTIFICATION_TYPE_LABELS,
  type NotificationWithRead,
  type NotificationType,
} from '@/lib/notifications'
import { formatDateRelative } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Shared notification inbox — used by both parent and coach roles.
 * Role label in the header is customized by the caller.
 */
interface Props {
  role: 'parent' | 'coach'
}

export function NotificationInboxPage({ role }: Props) {
  const { user } = useAuth()
  const [items, setItems] = useState<NotificationWithRead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    if (!user) return
    setIsLoading(true)
    const list = await listMyNotifications(user.id)
    setItems(list)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const unreadIds = items.filter((i) => !i.is_read).map((i) => i.id)

  const handleMarkAll = async () => {
    if (!user || unreadIds.length === 0) return
    await markAllAsRead(unreadIds, user.id)
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })))
  }

  const handleMarkOne = async (id: string) => {
    if (!user) return
    await markAsRead(id, user.id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: true } : i)))
  }

  const roleLabel = role === 'parent' ? 'Veli Paneli' : 'Antrenör Paneli'

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        kicker={roleLabel}
        title="Bildirimler"
        description={
          unreadIds.length > 0 ? `${unreadIds.length} okunmamış bildirim` : 'Tümü okundu'
        }
        action={
          unreadIds.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={handleMarkAll}>
              <Check className="w-4 h-4" />
              Tümünü Okundu İşaretle
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Bildirim yok"
          description="Yönetici bir bildirim gönderdiğinde burada görünecek."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <NotificationRow key={n.id} notification={n} onMarkRead={handleMarkOne} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Row ─────────────────────────────────────────────────────────────────────

const ICONS: Record<NotificationType, typeof Bell> = {
  general: Bell,
  birthday: Cake,
  payment: CreditCard,
  exam: Award,
  attendance: ClipboardCheck,
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: NotificationWithRead
  onMarkRead: (id: string) => void
}) {
  const Icon = ICONS[notification.type] ?? Bell

  return (
    <button
      onClick={() => !notification.is_read && onMarkRead(notification.id)}
      className={cn(
        'w-full text-left rounded-lg p-4 transition-all shadow-ambient',
        notification.is_read
          ? 'bg-surface-card border-l-4 border-l-transparent'
          : 'bg-primary-container/50 border-l-4 border-l-primary',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            notification.is_read ? 'bg-surface-low text-on-surface/50' : 'bg-primary text-white',
          )}
        >
          {notification.is_read ? <Icon className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-title-md text-on-surface">
              {notification.title}
            </h3>
            <span className="text-label-sm uppercase tracking-widest font-semibold text-on-surface/40">
              {NOTIFICATION_TYPE_LABELS[notification.type]}
            </span>
          </div>
          <p className="text-body-md text-on-surface/70 mt-1 whitespace-pre-line">{notification.body}</p>
          <p className="text-label-sm text-on-surface/40 mt-2">
            {formatDateRelative(notification.created_at)}
          </p>
          {notification.link_url && (
            <a
              href={notification.link_url}
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center gap-1.5 text-body-sm text-primary font-semibold hover:underline"
            >
              Detaya git
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        {!notification.is_read && (
          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" aria-label="Okunmadı" />
        )}
      </div>
    </button>
  )
}

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Bell,
  Send,
  Trash2,
  Users,
  User,
  UserCog,
  Shield,
  Clock,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import {
  sendNotification,
  listAllNotifications,
  deleteNotification,
  NOTIFICATION_TYPE_LABELS,
  TARGET_LABELS,
  type AppNotification,
  type NotificationTarget,
  type NotificationType,
} from '@/lib/notifications'
import { useAuth } from '@/hooks/useAuth'
import { formatDateRelative } from '@/utils/format'
import { cn } from '@/utils/cn'

interface ComposeFormValues {
  title: string
  body: string
  target_role: NotificationTarget
  type: NotificationType
}

const TARGETS: { value: NotificationTarget; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'all', label: TARGET_LABELS.all, icon: Users },
  { value: 'parent', label: TARGET_LABELS.parent, icon: User },
  { value: 'coach', label: TARGET_LABELS.coach, icon: UserCog },
  { value: 'admin', label: TARGET_LABELS.admin, icon: Shield },
]

const TYPES: NotificationType[] = ['general', 'exam', 'payment', 'attendance', 'birthday']

export function AdminNotificationsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ComposeFormValues>({
    defaultValues: {
      title: '',
      body: '',
      target_role: 'all',
      type: 'general',
    },
  })

  const targetRole = watch('target_role')
  const type = watch('type')

  const load = async () => {
    setIsLoading(true)
    const list = await listAllNotifications()
    setItems(list)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (data: ComposeFormValues) => {
    const { error } = await sendNotification(
      {
        title: data.title,
        body: data.body,
        target_role: data.target_role,
        type: data.type,
      },
      user?.id ?? null,
    )

    if (error) {
      setError('root', { message: error })
      return
    }

    reset({ title: '', body: '', target_role: data.target_role, type: data.type })
    void load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu bildirimi silmek istediğinize emin misiniz?')) return
    setDeletingId(id)
    const { error } = await deleteNotification(id)
    if (!error) setItems((prev) => prev.filter((n) => n.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">Bildirimler</h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          Tüm kullanıcılara veya belirli rollere uygulama içi bildirim gönderin.
        </p>
      </div>

      {/* Composer */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display font-bold text-title-lg text-on-surface">Yeni Bildirim</h2>
          </div>

          {/* Target */}
          <div className="flex flex-col gap-2">
            <span className="text-label-md text-on-surface/80 font-medium">Hedef</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TARGETS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('target_role', value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg text-body-sm font-semibold transition-colors',
                    targetRole === value
                      ? 'bg-primary text-white shadow-primary-glow/20'
                      : 'bg-surface-low text-on-surface/60 hover:bg-surface-high',
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            <span className="text-label-md text-on-surface/80 font-medium">Tür</span>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-label-md uppercase tracking-widest font-semibold transition-colors',
                    type === t
                      ? 'bg-secondary text-white'
                      : 'bg-surface-low text-on-surface/60 hover:bg-surface-high',
                  )}
                >
                  {NOTIFICATION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Başlık"
            type="text"
            placeholder="Örn. Nisan Ayı Ödemeleri"
            error={errors.title?.message}
            {...register('title', { required: 'Başlık gereklidir.' })}
          />

          <Textarea
            label="Mesaj"
            rows={4}
            placeholder="Kullanıcılara gönderilecek mesaj..."
            error={errors.body?.message}
            {...register('body', {
              required: 'Mesaj gereklidir.',
              minLength: { value: 10, message: 'En az 10 karakter.' },
            })}
          />

          {errors.root && (
            <p className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2" role="alert">
              {errors.root.message}
            </p>
          )}

          {isSubmitSuccessful && !errors.root && (
            <p className="text-body-sm text-green-700 bg-green-50 rounded-md px-3 py-2">
              Bildirim gönderildi.
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="self-start">
            <Send className="w-4 h-4" />
            Gönder
          </Button>
        </form>
      </Card>

      {/* History */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-md uppercase tracking-widest text-on-surface/50 px-1">
          Gönderilen Bildirimler
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="md" />
          </div>
        ) : items.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <Bell className="w-10 h-10 text-on-surface/30" />
            <p className="font-display font-bold text-title-lg text-on-surface">
              Henüz bildirim yok
            </p>
            <p className="text-body-md text-on-surface/60">
              Yukarıdan ilk bildiriminizi oluşturun.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((n) => (
              <Card key={n.id} padding="sm" className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-semibold text-body-md text-on-surface truncate">
                      {n.title}
                    </h4>
                    <Badge variant="default">
                      {TARGET_LABELS[(n.target_role ?? 'all') as NotificationTarget]}
                    </Badge>
                    <Badge variant="secondary">
                      {NOTIFICATION_TYPE_LABELS[n.type]}
                    </Badge>
                  </div>
                  <p className="text-body-sm text-on-surface/60 mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-label-sm text-on-surface/40 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateRelative(n.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(n.id)}
                  loading={deletingId === n.id}
                  className="text-primary hover:bg-primary/5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
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
  UserCheck,
  Search,
  X,
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
import { listProfiles } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile } from '@/types/auth.types'
import { formatDateRelative } from '@/utils/format'
import { cn } from '@/utils/cn'

type DeliveryMode = 'broadcast' | 'role' | 'users'

interface ComposeFormValues {
  title: string
  body: string
  type: NotificationType
}

const ROLE_OPTIONS: { value: Exclude<NotificationTarget, 'all'>; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'parent', label: TARGET_LABELS.parent, icon: User },
  { value: 'coach', label: TARGET_LABELS.coach, icon: UserCog },
  { value: 'admin', label: TARGET_LABELS.admin, icon: Shield },
]

const TYPES: NotificationType[] = ['general', 'exam', 'payment', 'attendance', 'birthday']

export function AdminNotificationsPage() {
  const { user } = useAuth()

  // ─── Delivery mode state ──────────────────────────────────────────────────
  const [mode, setMode] = useState<DeliveryMode>('broadcast')
  const [roleTarget, setRoleTarget] = useState<Exclude<NotificationTarget, 'all'>>('parent')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState('')

  // ─── Users list (for multi-select) ────────────────────────────────────────
  const [users, setUsers] = useState<UserProfile[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // ─── History ──────────────────────────────────────────────────────────────
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
    defaultValues: { title: '', body: '', type: 'general' },
  })

  const type = watch('type')

  const loadHistory = async () => {
    setIsLoading(true)
    const list = await listAllNotifications()
    setItems(list)
    setIsLoading(false)
  }

  const loadUsers = async () => {
    if (users.length > 0) return
    setUsersLoading(true)
    // Pull all approved users; most common mode (payment reminders) targets parents,
    // but admins may also want to reach coaches.
    const [parents, coaches] = await Promise.all([
      listProfiles({ role: 'parent', approval_status: 'approved' }),
      listProfiles({ role: 'coach', approval_status: 'approved' }),
    ])
    setUsers([...parents, ...coaches].filter((u) => u.is_active))
    setUsersLoading(false)
  }

  useEffect(() => {
    void loadHistory()
  }, [])

  useEffect(() => {
    if (mode === 'users') void loadUsers()
  }, [mode])

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users
    const q = userSearch.toLowerCase()
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').toLowerCase().includes(q),
    )
  }, [users, userSearch])

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const clearUsers = () => {
    setSelectedUserIds([])
    setUserSearch('')
  }

  const onSubmit = async (data: ComposeFormValues) => {
    if (mode === 'users' && selectedUserIds.length === 0) {
      setError('root', { message: 'En az bir kullanıcı seçin.' })
      return
    }

    const { error } = await sendNotification(
      {
        title: data.title,
        body: data.body,
        type: data.type,
        target_role:
          mode === 'broadcast' ? 'all' : mode === 'role' ? roleTarget : undefined,
        target_user_ids: mode === 'users' ? selectedUserIds : null,
      },
      user?.id ?? null,
    )

    if (error) {
      setError('root', { message: error })
      return
    }

    reset({ title: '', body: '', type: data.type })
    if (mode === 'users') clearUsers()
    void loadHistory()
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
          Tüm kullanıcılara, belirli bir role veya seçilen kişilere bildirim gönderin.
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

          {/* Delivery mode */}
          <div className="flex flex-col gap-2">
            <span className="text-label-md text-on-surface/80 font-medium">Gönderim Şekli</span>
            <div className="grid grid-cols-3 gap-2">
              <ModeButton
                active={mode === 'broadcast'}
                onClick={() => setMode('broadcast')}
                icon={Users}
                label="Herkes"
              />
              <ModeButton
                active={mode === 'role'}
                onClick={() => setMode('role')}
                icon={Shield}
                label="Rol Bazlı"
              />
              <ModeButton
                active={mode === 'users'}
                onClick={() => setMode('users')}
                icon={UserCheck}
                label="Belirli Kişiler"
              />
            </div>
          </div>

          {/* Role picker (only when mode=role) */}
          {mode === 'role' && (
            <div className="flex flex-col gap-2">
              <span className="text-label-md text-on-surface/80 font-medium">Rol</span>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRoleTarget(value)}
                    className={cn(
                      'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-body-sm font-semibold transition-colors',
                      roleTarget === value
                        ? 'bg-primary text-white'
                        : 'bg-surface-low text-on-surface/60 hover:bg-surface-high',
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User multi-select (only when mode=users) */}
          {mode === 'users' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-label-md text-on-surface/80 font-medium">
                  Alıcılar {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
                </span>
                {selectedUserIds.length > 0 && (
                  <button
                    type="button"
                    onClick={clearUsers}
                    className="text-label-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Temizle
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40" />
                <input
                  type="text"
                  placeholder="İsim, e-posta veya telefonla ara..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-low border border-outline/20 focus:border-primary focus:outline-none text-body-sm"
                />
              </div>

              <div className="max-h-80 overflow-y-auto rounded-lg border border-outline/10 divide-y divide-outline/10">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Spinner size="sm" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-body-sm text-on-surface/50 text-center py-6">
                    {userSearch ? 'Eşleşen kullanıcı yok.' : 'Aktif kullanıcı yok.'}
                  </p>
                ) : (
                  filteredUsers.map((u) => {
                    const checked = selectedUserIds.includes(u.id)
                    return (
                      <label
                        key={u.id}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors',
                          checked ? 'bg-primary/5' : 'hover:bg-surface-low',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleUser(u.id)}
                          className="w-4 h-4 accent-primary shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-medium text-on-surface truncate">
                            {u.full_name || u.email}
                          </p>
                          <p className="text-label-sm text-on-surface/50 truncate">
                            {u.email} · {TARGET_LABELS[u.role as NotificationTarget] ?? u.role}
                          </p>
                        </div>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          )}

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
            {items.map((n) => {
              const targetLabel = n.target_user_ids && n.target_user_ids.length > 0
                ? `${n.target_user_ids.length} kişi`
                : n.target_user
                  ? 'Tek kişi'
                  : TARGET_LABELS[(n.target_role ?? 'all') as NotificationTarget]
              return (
                <Card key={n.id} padding="sm" className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-semibold text-body-md text-on-surface truncate">
                        {n.title}
                      </h4>
                      <Badge variant="default">{targetLabel}</Badge>
                      <Badge variant="secondary">{NOTIFICATION_TYPE_LABELS[n.type]}</Badge>
                      {n.sent_push_at && <Badge variant="success">Push ✓</Badge>}
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-lg text-body-sm font-semibold transition-colors',
        active
          ? 'bg-primary text-white shadow-primary-glow/20'
          : 'bg-surface-low text-on-surface/60 hover:bg-surface-high',
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  )
}

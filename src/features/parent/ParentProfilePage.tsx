import { useForm } from 'react-hook-form'
import { Lock, Check, User, Phone, Mail } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { useAuth } from '@/hooks/useAuth'
import { updateOwnProfile } from '@/lib/auth'

interface FormValues {
  full_name: string
  phone: string
  avatar_url: string
}

/**
 * Parent: self profile editing.
 * Users can update their own full_name, phone and avatar_url.
 * Email and password are read-only here — those require separate flows.
 */
export function ParentProfilePage() {
  const { user, setUser } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
      avatar_url: user?.avatar_url ?? '',
    },
    values: user
      ? {
          full_name: user.full_name,
          phone: user.phone ?? '',
          avatar_url: user.avatar_url ?? '',
        }
      : undefined,
  })

  const currentAvatar = watch('avatar_url')

  if (!user) return null

  const onSubmit = async (data: FormValues) => {
    const { profile, error } = await updateOwnProfile(user.id, {
      full_name: data.full_name,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
    })

    if (error || !profile) {
      setError('root', { message: error ?? 'Güncelleme başarısız.' })
      return
    }

    setUser(profile)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Veli Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">Profil</h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          Kişisel bilgilerinizi güncelleyin.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          {/* Header with avatar uploader */}
          <div className="flex items-center gap-4 pb-4 border-b border-surface-low">
            <AvatarUpload
              value={currentAvatar || null}
              ownerId={user.id}
              fallbackLabel={user.full_name || user.email}
              onChange={(url) => setValue('avatar_url', url ?? '', { shouldDirty: true })}
            />
            <div>
              <p className="font-display font-bold text-title-lg text-on-surface">
                {user.full_name || 'İsimsiz'}
              </p>
              <p className="text-body-sm text-on-surface/50">Veli</p>
            </div>
          </div>

          {/* Read-only email */}
          <div className="flex flex-col gap-1.5">
            <span className="text-label-md text-on-surface/80 font-medium">E-posta</span>
            <div className="flex items-center gap-2 w-full rounded-md bg-surface-low px-4 min-h-touch text-body-md text-on-surface/60">
              <Mail className="w-4 h-4 text-on-surface/40 shrink-0" />
              <span className="truncate flex-1">{user.email}</span>
              <Lock className="w-3.5 h-3.5 text-on-surface/30 shrink-0" />
            </div>
          </div>

          <Input
            label="Ad Soyad"
            type="text"
            placeholder="Adınız Soyadınız"
            autoComplete="name"
            error={errors.full_name?.message}
            {...register('full_name', {
              required: 'Ad soyad gereklidir.',
              minLength: { value: 2, message: 'En az 2 karakter olmalıdır.' },
            })}
          />

          <Input
            label="Telefon"
            type="tel"
            placeholder="+90 5XX XXX XX XX"
            autoComplete="tel"
            hint="İletişim ve bildirimler için"
            error={errors.phone?.message}
            {...register('phone')}
          />

          {/* avatar_url is managed by the AvatarUpload above */}
          <input type="hidden" {...register('avatar_url')} />

          {/* Security notice */}
          <div className="flex items-start gap-2.5 bg-surface-low rounded-md px-3 py-2.5">
            <Lock className="w-4 h-4 text-on-surface/40 shrink-0 mt-0.5" />
            <p className="text-body-sm text-on-surface/60 leading-relaxed">
              Güvenlik nedeniyle e-posta ve şifre değiştirme ayrı bir akışta yapılır.
            </p>
          </div>

          {errors.root && (
            <p
              className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2"
              role="alert"
            >
              {errors.root.message}
            </p>
          )}

          {isSubmitSuccessful && !errors.root && (
            <p
              className="text-body-sm text-green-700 bg-green-50 rounded-md px-3 py-2 flex items-center gap-2"
              role="status"
            >
              <Check className="w-4 h-4" />
              Bilgileriniz güncellendi.
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="self-start"
          >
            Kaydet
          </Button>
        </form>
      </Card>

      {/* Quick info */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Card padding="sm" className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">Rol</p>
            <p className="font-display font-semibold text-body-md text-on-surface">Veli</p>
          </div>
        </Card>
        <Card padding="sm" className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">Telefon</p>
            <p className="font-display font-semibold text-body-md text-on-surface">
              {user.phone || 'Henüz eklenmedi'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

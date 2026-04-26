import { useForm } from 'react-hook-form'
import { Lock, Check, User, Phone, Mail, KeyRound } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { PageHeader } from '@/components/dashboard'
import { useAuth } from '@/hooks/useAuth'
import { updateOwnProfile, updatePassword } from '@/lib/auth'

interface ProfileFormValues {
  full_name: string
  phone: string
  avatar_url: string
}

interface PasswordFormValues {
  current_password: string
  new_password: string
  confirm_password: string
}

/**
 * Coach: self profile editing.
 * Editable: full_name, phone, avatar_url, password.
 * Email is read-only — changing it requires a separate confirmation flow.
 */
export function CoachProfilePage() {
  const { user, setUser } = useAuth()

  const profileForm = useForm<ProfileFormValues>({
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

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const currentAvatar = profileForm.watch('avatar_url')

  if (!user) return null

  const onProfileSubmit = async (data: ProfileFormValues) => {
    const { profile, error } = await updateOwnProfile(user.id, {
      full_name: data.full_name,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
    })

    if (error || !profile) {
      profileForm.setError('root', { message: error ?? 'Güncelleme başarısız.' })
      return
    }

    setUser(profile)
  }

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (data.new_password !== data.confirm_password) {
      passwordForm.setError('confirm_password', { message: 'Şifreler eşleşmiyor.' })
      return
    }
    if (data.new_password === data.current_password) {
      passwordForm.setError('new_password', {
        message: 'Yeni şifre mevcut şifreden farklı olmalıdır.',
      })
      return
    }

    const { error } = await updatePassword(user.email, data.current_password, data.new_password)
    if (error) {
      passwordForm.setError('root', { message: error })
      return
    }

    passwordForm.reset({
      current_password: '',
      new_password: '',
      confirm_password: '',
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        kicker="Antrenör Paneli"
        title="Profil"
        description="Hesap bilgilerinizi ve şifrenizi güncelleyin."
      />


      {/* ── Profil bilgileri ── */}
      <Card>
        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <div className="flex items-center gap-4 pb-4 border-b border-surface-low">
            <AvatarUpload
              value={currentAvatar || null}
              ownerId={user.id}
              fallbackLabel={user.full_name || user.email}
              onChange={(url) =>
                profileForm.setValue('avatar_url', url ?? '', { shouldDirty: true })
              }
            />
            <div>
              <p className="font-display font-bold text-title-lg text-on-surface">
                {user.full_name || 'İsimsiz'}
              </p>
              <p className="text-body-sm text-on-surface/50">Antrenör</p>
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
            error={profileForm.formState.errors.full_name?.message}
            {...profileForm.register('full_name', {
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
            error={profileForm.formState.errors.phone?.message}
            {...profileForm.register('phone')}
          />

          {/* avatar_url is managed by the AvatarUpload above */}
          <input type="hidden" {...profileForm.register('avatar_url')} />

          {profileForm.formState.errors.root && (
            <p
              className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2"
              role="alert"
            >
              {profileForm.formState.errors.root.message}
            </p>
          )}

          {profileForm.formState.isSubmitSuccessful && !profileForm.formState.errors.root && (
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
            loading={profileForm.formState.isSubmitting}
            className="self-start"
          >
            Kaydet
          </Button>
        </form>
      </Card>

      {/* ── Şifre değiştir ── */}
      <Card>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <div className="flex items-center gap-3 pb-1">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-title-md text-on-surface">
                Şifre Değiştir
              </h2>
              <p className="text-body-sm text-on-surface/50">
                Yeni şifre en az 6 karakter olmalıdır.
              </p>
            </div>
          </div>

          <Input
            label="Mevcut Şifre"
            type="password"
            autoComplete="current-password"
            error={passwordForm.formState.errors.current_password?.message}
            {...passwordForm.register('current_password', {
              required: 'Mevcut şifre gereklidir.',
            })}
          />

          <Input
            label="Yeni Şifre"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.new_password?.message}
            {...passwordForm.register('new_password', {
              required: 'Yeni şifre gereklidir.',
              minLength: { value: 6, message: 'En az 6 karakter olmalıdır.' },
            })}
          />

          <Input
            label="Yeni Şifre (Tekrar)"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.confirm_password?.message}
            {...passwordForm.register('confirm_password', {
              required: 'Yeni şifreyi tekrar girin.',
            })}
          />

          {passwordForm.formState.errors.root && (
            <p
              className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2"
              role="alert"
            >
              {passwordForm.formState.errors.root.message}
            </p>
          )}

          {passwordForm.formState.isSubmitSuccessful &&
            !passwordForm.formState.errors.root && (
              <p
                className="text-body-sm text-green-700 bg-green-50 rounded-md px-3 py-2 flex items-center gap-2"
                role="status"
              >
                <Check className="w-4 h-4" />
                Şifreniz güncellendi.
              </p>
            )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={passwordForm.formState.isSubmitting}
            className="self-start"
          >
            Şifreyi Güncelle
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
            <p className="font-display font-semibold text-body-md text-on-surface">Antrenör</p>
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

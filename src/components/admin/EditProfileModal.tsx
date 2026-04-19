import { useForm } from 'react-hook-form'
import { Lock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { adminUpdateProfile } from '@/lib/auth'
import type { UserProfile } from '@/types/auth.types'
import { ROLE_LABELS } from '@/types/auth.types'

interface EditProfileModalProps {
  profile: UserProfile | null
  isOpen: boolean
  onClose: () => void
  onSaved: (updated: UserProfile) => void
}

interface FormValues {
  full_name: string
  phone: string
  avatar_url: string
}

/**
 * Admin-only profile edit modal.
 *
 * Editable: full_name, phone, avatar_url
 * NOT editable (per Phase 4 rule): email, password
 * Email/password changes require a separate, security-hardened flow.
 */
export function EditProfileModal({
  profile,
  isOpen,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      avatar_url: profile?.avatar_url ?? '',
    },
    values: profile
      ? {
          full_name: profile.full_name,
          phone: profile.phone ?? '',
          avatar_url: profile.avatar_url ?? '',
        }
      : undefined,
  })

  if (!profile) return null

  const onSubmit = async (data: FormValues) => {
    const { profile: updated, error } = await adminUpdateProfile(profile.id, {
      full_name: data.full_name,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
    })

    if (error || !updated) {
      setError('root', { message: error ?? 'Güncelleme başarısız.' })
      return
    }

    onSaved(updated)
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${ROLE_LABELS[profile.role]} bilgilerini düzenle`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex justify-center pt-1">
          <AvatarUpload
            value={watch('avatar_url') || null}
            ownerId={profile.id}
            fallbackLabel={profile.full_name || profile.email}
            onChange={(url) => setValue('avatar_url', url ?? '', { shouldDirty: true })}
          />
        </div>
        <input type="hidden" {...register('avatar_url')} />

        {/* Read-only: email */}
        <ReadOnlyField label="E-posta" value={profile.email} />

        <Input
          label="Ad Soyad"
          type="text"
          placeholder="Ad Soyad"
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
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* Password note */}
        <div className="flex items-start gap-2.5 bg-surface-low rounded-md px-3 py-2.5">
          <Lock className="w-4 h-4 text-on-surface/40 shrink-0 mt-0.5" />
          <p className="text-body-sm text-on-surface/60 leading-relaxed">
            Güvenlik nedeniyle e-posta ve şifre buradan değiştirilemez.
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

        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            className="flex-1"
          >
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-label-md text-on-surface/80 font-medium">{label}</span>
      <div className="flex items-center gap-2 w-full rounded-md bg-surface-low px-4 min-h-touch text-body-md text-on-surface/60">
        <Lock className="w-3.5 h-3.5 text-on-surface/30 shrink-0" />
        <span className="truncate">{value}</span>
      </div>
    </div>
  )
}

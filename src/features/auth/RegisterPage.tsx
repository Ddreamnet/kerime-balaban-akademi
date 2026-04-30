import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, UserCog, Clock, CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PanelBackdrop } from '@/components/layout/PanelBackdrop'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { signUp } from '@/lib/auth'
import type { SignupRole } from '@/types/auth.types'
import { cn } from '@/utils/cn'

interface RegisterFormValues {
  full_name: string
  email: string
  phone: string
  password: string
  password_confirm: string
}

type SuccessState =
  | { kind: 'none' }
  | { kind: 'pending'; needsEmail: boolean }

export function RegisterPage() {
  const [role, setRole] = useState<SignupRole>('parent')
  const [success, setSuccess] = useState<SuccessState>({ kind: 'none' })

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>()

  const password = watch('password')

  const onSubmit = async (data: RegisterFormValues) => {
    const { error, needsEmailConfirmation } = await signUp(
      data.email,
      data.password,
      data.full_name,
      data.phone,
      role,
    )

    if (error) {
      setError('root', { message: error })
      return
    }

    setSuccess({ kind: 'pending', needsEmail: needsEmailConfirmation })
  }

  if (success.kind === 'pending') {
    return <SuccessScreen needsEmail={success.needsEmail} />
  }

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="font-display font-bold text-headline-lg text-on-surface">
            Kayıt Ol
          </h1>
          <p className="text-body-md text-on-surface/60 mt-1">
            Hesap oluşturun
          </p>
        </div>

          <Card className="w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
              {/* ─── Role selector ─── */}
              <div className="flex flex-col gap-2">
                <span className="text-label-md text-on-surface/80 font-medium">
                  Hesap Tipi
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <RoleOption
                    value="parent"
                    selected={role === 'parent'}
                    onSelect={setRole}
                    icon={User}
                    label="Veli"
                    description="Çocuğum için"
                  />
                  <RoleOption
                    value="coach"
                    selected={role === 'coach'}
                    onSelect={setRole}
                    icon={UserCog}
                    label="Antrenör"
                    description="Ders verecek"
                  />
                </div>
              </div>

              {/* ─── Form fields ─── */}
              <Input
                label="Ad Soyad"
                type="text"
                placeholder="Adınız Soyadınız"
                autoComplete="name"
                autoCapitalize="words"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                error={errors.full_name?.message}
                {...register('full_name', {
                  required: 'Ad soyad gereklidir.',
                  minLength: { value: 2, message: 'En az 2 karakter olmalıdır.' },
                })}
              />

              <Input
                label="E-posta"
                type="email"
                placeholder="ornek@email.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
                spellCheck={false}
                enterKeyHint="next"
                error={errors.email?.message}
                {...register('email', {
                  required: 'E-posta adresi gereklidir.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Geçerli bir e-posta adresi girin.',
                  },
                })}
              />

              <Input
                label="Telefon"
                type="tel"
                placeholder="+90 5XX XXX XX XX"
                autoComplete="tel"
                inputMode="tel"
                autoCorrect="off"
                enterKeyHint="next"
                hint="İletişim ve bildirimler için"
                error={errors.phone?.message}
                {...register('phone', {
                  required: 'Telefon numarası gereklidir.',
                  pattern: {
                    value: /^[+0-9\s()-]{7,20}$/,
                    message: 'Geçerli bir telefon numarası girin.',
                  },
                })}
              />

              <Input
                label="Şifre"
                type="password"
                placeholder="En az 6 karakter"
                autoComplete="new-password"
                enterKeyHint="next"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Şifre gereklidir.',
                  minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır.' },
                })}
              />

              <Input
                label="Şifre Tekrar"
                type="password"
                placeholder="Şifrenizi tekrar girin"
                autoComplete="new-password"
                enterKeyHint="done"
                error={errors.password_confirm?.message}
                {...register('password_confirm', {
                  required: 'Şifre tekrarı gereklidir.',
                  validate: (v) => v === password || 'Şifreler eşleşmiyor.',
                })}
              />

              {/* Approval notice */}
              <div className="flex items-start gap-2.5 bg-yellow-50 rounded-md px-3 py-2.5">
                <Clock className="w-4 h-4 text-yellow-700 shrink-0 mt-0.5" />
                <p className="text-body-sm text-yellow-900/80 leading-relaxed">
                  Kaydınız yönetici onayına tabi tutulacaktır. Onaylandıktan sonra giriş yapabilirsiniz.
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
              >
                Kayıt Ol
              </Button>
            </form>
          </Card>

          <p className="text-body-md text-on-surface/60 text-center">
            Zaten hesabınız var mı?{' '}
            <Link to="/giris" className="text-primary font-semibold hover:text-primary-dark transition-colors">
              Giriş Yap
            </Link>
          </p>

        <Link
          to="/"
          className="text-body-sm text-on-surface/40 hover:text-on-surface/70 transition-colors"
        >
          ← Anasayfaya dön
        </Link>
      </div>
    </AuthShell>
  )
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] flex items-center overflow-hidden isolate py-12">
      <PanelBackdrop variant="absolute" />
      <Container narrow className="relative z-10">
        {children}
      </Container>
    </div>
  )
}

// ─── Role option card ───────────────────────────────────────────────────────

interface RoleOptionProps {
  value: SignupRole
  selected: boolean
  onSelect: (value: SignupRole) => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

function RoleOption({
  value,
  selected,
  onSelect,
  icon: Icon,
  label,
  description,
}: RoleOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={cn(
        'flex flex-col items-start gap-2 rounded-lg p-4 text-left',
        'transition-all duration-150 min-h-touch',
        'focus-visible:outline-2 focus-visible:outline-primary',
        selected
          ? 'bg-primary-container ring-2 ring-primary shadow-primary-glow/20'
          : 'bg-surface border border-outline/15 hover:bg-surface-low'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center',
          selected ? 'bg-primary text-white' : 'bg-surface-card text-on-surface/60'
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            'font-display font-semibold text-title-md',
            selected ? 'text-primary' : 'text-on-surface'
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            'text-body-sm',
            selected ? 'text-primary/70' : 'text-on-surface/50'
          )}
        >
          {description}
        </span>
      </div>
    </button>
  )
}

// ─── Success screen after registration ─────────────────────────────────────

function SuccessScreen({ needsEmail }: { needsEmail: boolean }) {
  return (
    <AuthShell>
      <Card className="flex flex-col items-center gap-5 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display font-bold text-headline-md text-on-surface">
              Kaydınız alındı!
            </h2>
            <p className="text-body-md text-on-surface/60 leading-relaxed">
              Hesabınız oluşturuldu. Yönetici onayından sonra giriş yapabilirsiniz.
              Onaylandığında sizi bilgilendireceğiz.
            </p>
            {needsEmail && (
              <p className="text-body-sm text-on-surface/50 bg-surface-low rounded-md px-3 py-2 mt-2">
                Ayrıca e-posta adresinize doğrulama bağlantısı gönderildi. Onay için e-postanızı kontrol edin.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
            <Link
              to="/giris"
              className={cn(
                'flex items-center justify-center min-h-btn px-6',
                'bg-gradient-primary text-white rounded-lg',
                'font-display font-semibold shadow-primary-glow/30',
                'hover:scale-[1.02] transition-all'
              )}
            >
              Giriş Sayfasına Dön
            </Link>
            <Link
              to="/"
              className="text-body-sm text-on-surface/50 hover:text-primary transition-colors text-center py-2"
            >
              Anasayfaya dön
            </Link>
          </div>
      </Card>
    </AuthShell>
  )
}

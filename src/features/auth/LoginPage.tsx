import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Clock, XCircle, AlertTriangle } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { signIn } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import { ROLE_DASHBOARD_ROUTES } from '@/types/auth.types'
import { cn } from '@/utils/cn'

interface LoginFormValues {
  email: string
  password: string
}

type GateState =
  | { kind: 'none' }
  | { kind: 'pending' }
  | { kind: 'rejected' }
  | { kind: 'inactive' }

export function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [gate, setGate] = useState<GateState>({ kind: 'none' })

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>()

  const onSubmit = async (data: LoginFormValues) => {
    setGate({ kind: 'none' })
    const result = await signIn(data.email, data.password)

    switch (result.kind) {
      case 'ok':
        setUser(result.profile)
        navigate(ROLE_DASHBOARD_ROUTES[result.profile.role], { replace: true })
        return
      case 'pending':
        setGate({ kind: 'pending' })
        reset({ email: data.email, password: '' })
        return
      case 'rejected':
        setGate({ kind: 'rejected' })
        reset({ email: data.email, password: '' })
        return
      case 'inactive':
        setGate({ kind: 'inactive' })
        reset({ email: data.email, password: '' })
        return
      case 'error':
        setError('root', { message: result.message })
        return
    }
  }

  if (gate.kind !== 'none') {
    return <GateScreen gate={gate} onBack={() => setGate({ kind: 'none' })} />
  }

  return (
    <Section bg="default" className="min-h-[calc(100dvh-4rem)] flex items-center">
      <Container narrow>
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="font-display font-bold text-headline-lg text-on-surface">
              Giriş Yap
            </h1>
            <p className="text-body-md text-on-surface/60 mt-1">
              Hesabınıza erişin
            </p>
          </div>

          <Card className="w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <Input
                label="E-posta"
                type="email"
                placeholder="ornek@email.com"
                autoComplete="email"
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
                label="Şifre"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password', { required: 'Şifre gereklidir.' })}
              />

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
                Giriş Yap
              </Button>
            </form>
          </Card>

          <p className="text-body-md text-on-surface/60 text-center">
            Hesabınız yok mu?{' '}
            <Link to="/kayit" className="text-primary font-semibold hover:text-primary-dark transition-colors">
              Kayıt Ol
            </Link>
          </p>

          <Link
            to="/"
            className="text-body-sm text-on-surface/40 hover:text-on-surface/70 transition-colors"
          >
            ← Anasayfaya dön
          </Link>
        </div>
      </Container>
    </Section>
  )
}

// ─── Gate screens: Pending, Rejected, Inactive ──────────────────────────────

function GateScreen({
  gate,
  onBack,
}: {
  gate: { kind: 'pending' | 'rejected' | 'inactive' }
  onBack: () => void
}) {
  const config = {
    pending: {
      Icon: Clock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-700',
      title: 'Hesabınız onay bekliyor',
      body:
        'Kaydınız alındı! Yönetici tarafından onaylandıktan sonra hesabınıza giriş yapabileceksiniz. Onaylandığında sizi bilgilendireceğiz.',
    },
    rejected: {
      Icon: XCircle,
      iconBg: 'bg-primary-container',
      iconColor: 'text-primary',
      title: 'Başvurunuz reddedildi',
      body:
        'Üzgünüz, kayıt talebiniz reddedilmiştir. Daha fazla bilgi için akademiyle iletişime geçebilirsiniz.',
    },
    inactive: {
      Icon: AlertTriangle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-700',
      title: 'Hesabınız devre dışı',
      body:
        'Hesabınız geçici olarak devre dışı bırakılmıştır. Lütfen akademiyle iletişime geçin.',
    },
  }[gate.kind]

  return (
    <Section bg="default" className="min-h-[calc(100dvh-4rem)] flex items-center">
      <Container narrow>
        <Card className="flex flex-col items-center gap-5 py-12 text-center">
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center', config.iconBg)}>
            <config.Icon className={cn('w-8 h-8', config.iconColor)} />
          </div>
          <div className="flex flex-col gap-2 max-w-sm">
            <h2 className="font-display font-bold text-headline-md text-on-surface">
              {config.title}
            </h2>
            <p className="text-body-md text-on-surface/60 leading-relaxed">
              {config.body}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
            <Button variant="primary" size="lg" fullWidth onClick={onBack}>
              Tekrar Dene
            </Button>
            <Link
              to="/iletisim"
              className="text-body-sm text-on-surface/50 hover:text-primary transition-colors text-center py-2"
            >
              Akademiyle iletişime geçin
            </Link>
          </div>
        </Card>
      </Container>
    </Section>
  )
}

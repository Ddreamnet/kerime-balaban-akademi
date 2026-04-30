import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PanelBackdrop } from '@/components/layout/PanelBackdrop'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { requestPasswordReset } from '@/lib/auth'

interface FormValues {
  email: string
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    const { error } = await requestPasswordReset(data.email.trim())
    if (error) {
      setError('root', { message: error })
      return
    }
    setSent(true)
  }

  return (
    <AuthShell>
      {sent ? (
        <Card className="flex flex-col items-center gap-5 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display font-bold text-headline-md text-on-surface">
              E-posta gönderildi
            </h2>
            <p className="text-body-md text-on-surface/65 leading-relaxed">
              Sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunu (ve
              gerekirse spam klasörünü) kontrol et. Bağlantı 1 saat geçerlidir.
            </p>
          </div>
          <Link
            to="/giris"
            className="text-body-sm text-primary font-semibold hover:text-primary-dark transition-colors py-2"
          >
            Giriş Sayfasına Dön
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="font-display font-bold text-headline-lg text-on-surface">
              Şifremi Unuttum
            </h1>
            <p className="text-body-md text-on-surface/60 mt-1">
              Kayıtlı e-posta adresine sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          <Card className="w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <Input
                label="E-posta"
                type="email"
                placeholder="ornek@email.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
                spellCheck={false}
                enterKeyHint="send"
                error={errors.email?.message}
                {...register('email', {
                  required: 'E-posta adresi gereklidir.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Geçerli bir e-posta adresi girin.',
                  },
                })}
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
                <Mail className="w-4 h-4" />
                Sıfırlama Bağlantısı Gönder
              </Button>
            </form>
          </Card>

          <Link
            to="/giris"
            className="text-body-sm text-on-surface/55 hover:text-primary transition-colors"
          >
            ← Giriş sayfasına dön
          </Link>
        </div>
      )}
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

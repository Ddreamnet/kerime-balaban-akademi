import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Lock, CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PanelBackdrop } from '@/components/layout/PanelBackdrop'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { setNewPassword } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface FormValues {
  password: string
  password_confirm: string
}

/**
 * Email'den gelen şifre sıfırlama linkine tıklayan kullanıcı buraya gelir.
 * Supabase otomatik bir "recovery" session başlatır (URL hash'inden token).
 * Bu session aktifken updateUser ile yeni şifre yazılır, sonra çıkış + login.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const password = watch('password')

  useEffect(() => {
    // Supabase otomatik olarak URL hash'inden recovery token'ı işler.
    // Birkaç ms bekle, getSession ile kontrol et.
    const check = async () => {
      const { data } = await supabase.auth.getSession()
      setHasSession(!!data.session)
    }
    void check()

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(!!session)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const onSubmit = async (data: FormValues) => {
    const { error } = await setNewPassword(data.password)
    if (error) {
      setError('root', { message: error })
      return
    }
    setDone(true)
    // Recovery session'ı temizle, kullanıcı yeni şifre ile login olsun.
    await supabase.auth.signOut()
    setTimeout(() => navigate('/giris', { replace: true }), 1800)
  }

  return (
    <AuthShell>
      {done ? (
        <Card className="flex flex-col items-center gap-5 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display font-bold text-headline-md text-on-surface">
              Şifreniz güncellendi
            </h2>
            <p className="text-body-md text-on-surface/65">
              Birazdan giriş sayfasına yönlendirileceksiniz.
            </p>
          </div>
        </Card>
      ) : hasSession === null ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !hasSession ? (
        <Card className="flex flex-col items-center gap-5 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-yellow-700" />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display font-bold text-headline-md text-on-surface">
              Sıfırlama bağlantısı geçersiz
            </h2>
            <p className="text-body-md text-on-surface/65">
              Bağlantının süresi dolmuş ya da daha önce kullanılmış olabilir.
              Lütfen yeni bir sıfırlama bağlantısı talep edin.
            </p>
          </div>
          <Link
            to="/sifremi-unuttum"
            className="text-body-sm text-primary font-semibold hover:text-primary-dark transition-colors py-2"
          >
            Yeni bağlantı al
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="font-display font-bold text-headline-lg text-on-surface">
              Yeni Şifre Belirle
            </h1>
            <p className="text-body-md text-on-surface/60 mt-1">
              En az 6 karakter olmalı.
            </p>
          </div>

          <Card className="w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <Input
                label="Yeni Şifre"
                type="password"
                autoComplete="new-password"
                enterKeyHint="next"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Şifre gereklidir.',
                  minLength: { value: 6, message: 'En az 6 karakter olmalı.' },
                })}
              />

              <Input
                label="Şifre Tekrar"
                type="password"
                autoComplete="new-password"
                enterKeyHint="next"
                placeholder="••••••••"
                error={errors.password_confirm?.message}
                {...register('password_confirm', {
                  required: 'Şifre tekrarı gereklidir.',
                  validate: (v) => v === password || 'Şifreler eşleşmiyor.',
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
                Şifreyi Güncelle
              </Button>
            </form>
          </Card>
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

import { useForm } from 'react-hook-form'
import { Phone, MessageCircle, MapPin, CheckCircle2 } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface LeadFormValues {
  name: string
  phone: string
}

export function CTASection() {
  const settings = useSiteSettings()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LeadFormValues>()

  const onSubmit = (data: LeadFormValues) => {
    const message =
      `Merhaba! Ücretsiz deneme dersi hakkında bilgi almak istiyorum.\n` +
      `Ad Soyad: ${data.name}\n` +
      `Telefon: ${data.phone}`

    const whatsappHref = `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappHref, '_blank', 'noopener,noreferrer')
    reset()
  }

  return (
    <Section bg="dark" className="relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute -right-16 top-0 bottom-0 w-1/3 bg-gradient-primary opacity-[0.08] -skew-x-6 pointer-events-none" />

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start">

          {/* Left: Copy */}
          <div className="flex flex-col gap-7">
            <div>
              <p className="text-label-md text-primary uppercase tracking-widest mb-3">
                {settings.home_cta_label}
              </p>
              <h2 className="font-display font-black text-white text-display-sm md:text-display-md leading-tight">
                {settings.home_cta_headline}
                {settings.home_cta_headline_highlight && (
                  <>
                    {' '}
                    <span className="text-gradient-primary italic">
                      {settings.home_cta_headline_highlight}
                    </span>
                  </>
                )}
                {settings.home_cta_headline_suffix && <> {settings.home_cta_headline_suffix}</>}
              </h2>
            </div>

            <p className="text-body-lg text-white/65 leading-relaxed">
              {settings.home_cta_body}
            </p>

            {/* Benefits */}
            <ul className="flex flex-col gap-3">
              {settings.home_cta_benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-body-md text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            {/* Direct contact */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={settings.phoneLink}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-body-sm font-semibold transition-colors"
              >
                <Phone className="w-4 h-4" />
                {settings.phone}
              </a>
              <a
                href={settings.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 text-body-sm font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            <div className="flex items-center gap-2 text-body-sm text-white/30">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {settings.address}
            </div>
          </div>

          {/* Right: Lead form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="font-display font-bold text-white text-headline-sm">
                  {settings.home_cta_form_title}
                </h3>
                <p className="text-body-sm text-white/50 mt-1">
                  {settings.home_cta_form_subtitle}
                </p>
              </div>

              {isSubmitSuccessful ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                  <div>
                    <p className="font-display font-semibold text-white text-title-lg">
                      WhatsApp açılıyor!
                    </p>
                    <p className="text-body-sm text-white/50 mt-1">
                      Mesajı gönderin, en kısa sürede dönelim.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reset()}
                    className="text-white/60 hover:text-white"
                  >
                    Tekrar doldur
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                  noValidate
                >
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md text-white/70 font-medium">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      placeholder="Adınız Soyadınız"
                      autoComplete="name"
                      className="w-full rounded-md bg-white/10 border border-white/10 px-4 min-h-touch text-body-md text-white placeholder:text-white/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-colors"
                      {...register('name', { required: 'Ad soyad gereklidir.' })}
                    />
                    {errors.name && (
                      <p className="text-body-sm text-primary-gradient">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md text-white/70 font-medium">
                      Telefon Numarası
                    </label>
                    <input
                      type="tel"
                      placeholder="+90 5XX XXX XX XX"
                      autoComplete="tel"
                      className="w-full rounded-md bg-white/10 border border-white/10 px-4 min-h-touch text-body-md text-white placeholder:text-white/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-colors"
                      {...register('phone', { required: 'Telefon numarası gereklidir.' })}
                    />
                    {errors.phone && (
                      <p className="text-body-sm text-primary-gradient">{errors.phone.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    className="mt-2 shadow-primary-glow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp ile Gönder
                  </Button>

                  <p className="text-body-sm text-white/30 text-center">
                    Bilgileriniz yalnızca sizinle iletişim için kullanılır.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </Container>
    </Section>
  )
}

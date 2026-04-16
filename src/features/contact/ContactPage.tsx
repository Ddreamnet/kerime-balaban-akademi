import { useForm } from 'react-hook-form'
import { Phone, MessageCircle, MapPin, Clock, CheckCircle2, Mail } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { academyInfo, contactLinks } from '@/data/academyInfo'

interface ContactFormValues {
  name: string
  phone: string
  message: string
}

export function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactFormValues>()

  const onSubmit = (data: ContactFormValues) => {
    const text =
      `Merhaba Kerime Balaban Akademi!\n\n` +
      `Ad Soyad: ${data.name}\n` +
      `Telefon: ${data.phone}\n\n` +
      `Mesaj:\n${data.message}`
    const href = `https://wa.me/${academyInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
    window.open(href, '_blank', 'noopener,noreferrer')
    reset()
  }

  return (
    <>
      <PageHero
        label="İletişim"
        headline="Hep buradayız."
        body="Soru, kayıt ya da bilgi için bize her kanaldan ulaşabilirsiniz. En hızlı yanıt WhatsApp'tan gelir."
      />

      <Section bg="default">
        <Container>
          <div className="grid lg:grid-cols-[1fr_380px] gap-10 xl:gap-16 items-start">

            {/* Contact form */}
            <div className="flex flex-col gap-6">
              <SectionHeader
                label="Mesaj Gönderin"
                headline="Bize yazın."
              />

              {isSubmitSuccessful ? (
                <Card className="flex flex-col items-center gap-4 py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <div>
                    <p className="font-display font-bold text-headline-sm text-on-surface">
                      WhatsApp açılıyor!
                    </p>
                    <p className="text-body-md text-on-surface/60 mt-2">
                      Mesajınızı onaylayıp gönderin. En kısa sürede size dönelim.
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => reset()}>
                    Yeni mesaj gönder
                  </Button>
                </Card>
              ) : (
                <Card>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-5"
                    noValidate
                  >
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="Ad Soyad"
                        type="text"
                        placeholder="Adınız Soyadınız"
                        autoComplete="name"
                        error={errors.name?.message}
                        {...register('name', { required: 'Ad soyad gereklidir.' })}
                      />
                      <Input
                        label="Telefon"
                        type="tel"
                        placeholder="+90 5XX XXX XX XX"
                        autoComplete="tel"
                        error={errors.phone?.message}
                        {...register('phone', { required: 'Telefon numarası gereklidir.' })}
                      />
                    </div>

                    <Textarea
                      label="Mesajınız"
                      placeholder="Kayıt, bilgi ya da başka bir konu hakkında yazabilirsiniz..."
                      rows={5}
                      error={errors.message?.message}
                      {...register('message', {
                        required: 'Lütfen bir mesaj yazın.',
                        minLength: { value: 10, message: 'Mesaj en az 10 karakter olmalıdır.' },
                      })}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isSubmitting}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp ile Gönder
                    </Button>
                  </form>
                </Card>
              )}
            </div>

            {/* Contact info sidebar */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-28">
              <SectionHeader
                label="Ulaşın"
                headline="Direk iletişim."
              />

              {/* Contact cards */}
              <Card className="flex flex-col gap-4">
                <a
                  href={contactLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 text-body-md">WhatsApp</p>
                    <p className="text-body-sm text-green-700/70">{academyInfo.phone}</p>
                  </div>
                  <span className="ml-auto text-green-700 text-body-sm font-semibold group-hover:underline">
                    Yaz →
                  </span>
                </a>

                <a
                  href={contactLinks.phone}
                  className="flex items-center gap-4 p-4 rounded-lg bg-surface-low hover:bg-surface-high transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-body-md">Telefon</p>
                    <p className="text-body-sm text-on-surface/60">{academyInfo.phone}</p>
                  </div>
                  <span className="ml-auto text-primary text-body-sm font-semibold group-hover:underline">
                    Ara →
                  </span>
                </a>

                {academyInfo.email && (
                  <a
                    href={`mailto:${academyInfo.email}`}
                    className="flex items-center gap-4 p-4 rounded-lg bg-surface-low hover:bg-surface-high transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-body-md">E-posta</p>
                      <p className="text-body-sm text-on-surface/60">{academyInfo.email}</p>
                    </div>
                  </a>
                )}
              </Card>

              {/* Address */}
              <Card>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-on-surface text-body-md">Adres</p>
                      <p className="text-body-sm text-on-surface/60 mt-0.5">{academyInfo.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-on-surface text-body-md">Antrenman Saatleri</p>
                      <p className="text-body-sm text-on-surface/60 mt-0.5">
                        Pazartesi, Çarşamba, Cuma
                      </p>
                      <p className="text-body-sm text-on-surface/60">15:30 – 20:30</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Map placeholder */}
              <div className="rounded-xl overflow-hidden bg-surface-low aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center px-6">
                  <MapPin className="w-8 h-8 text-primary/40" />
                  <p className="text-body-sm text-on-surface/40">
                    Harita yakında eklenecek
                  </p>
                  {academyInfo.google_maps_url && (
                    <a
                      href={academyInfo.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-sm text-primary hover:underline"
                    >
                      Google Maps'te Aç →
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </>
  )
}

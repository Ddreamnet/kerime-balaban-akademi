import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Check, Info, Phone, MessageCircle, Mail, MapPin, Instagram, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { getSiteContent, updateSiteContent } from '@/lib/siteContent'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface FormValues {
  phone: string
  whatsapp: string
  email: string
  address: string
  district: string
  instagram: string
  hero_headline: string
  hero_highlight: string
  hero_subtext: string
  google_maps_url: string
}

/**
 * Admin: Site Content — admin-editable public settings.
 * Saved values override the static defaults in src/data/academyInfo.ts.
 */
export function AdminSiteContentPage() {
  const { refresh } = useSiteSettings()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>()

  useEffect(() => {
    const load = async () => {
      const content = await getSiteContent()
      reset({
        phone: content.phone ?? '',
        whatsapp: content.whatsapp ?? '',
        email: content.email ?? '',
        address: content.address ?? '',
        district: content.district ?? '',
        instagram: content.instagram ?? '',
        hero_headline: content.hero_headline ?? '',
        hero_highlight: content.hero_highlight ?? '',
        hero_subtext: content.hero_subtext ?? '',
        google_maps_url: content.google_maps_url ?? '',
      })
    }
    void load()
  }, [reset])

  const onSubmit = async (data: FormValues) => {
    const { error } = await updateSiteContent({
      phone: data.phone.trim() || null,
      whatsapp: data.whatsapp.trim() || null,
      email: data.email.trim() || null,
      address: data.address.trim() || null,
      district: data.district.trim() || null,
      instagram: data.instagram.trim() || null,
      hero_headline: data.hero_headline.trim() || null,
      hero_highlight: data.hero_highlight.trim() || null,
      hero_subtext: data.hero_subtext.trim() || null,
      google_maps_url: data.google_maps_url.trim() || null,
    })

    if (error) {
      setError('root', { message: error })
      return
    }

    await refresh()
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">Site İçeriği</h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          Anasayfa ve iletişim bilgilerini buradan güncelleyin. Değişiklikler anında siteye yansır.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        {/* Contact group */}
        <Card>
          <div className="flex flex-col gap-4">
            <SectionTitle icon={Phone}>İletişim Bilgileri</SectionTitle>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Telefon"
                type="tel"
                placeholder="+90 5XX XXX XX XX"
                {...register('phone')}
              />
              <Input
                label="WhatsApp Numarası"
                type="tel"
                placeholder="+905XXXXXXXXX"
                hint="Boşluksuz, ülke koduyla (WhatsApp linkleri için)"
                {...register('whatsapp')}
              />
            </div>

            <Input
              label="E-posta"
              type="email"
              placeholder="info@akademi.com"
              {...register('email')}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Adres"
                type="text"
                placeholder="Bartın Merkez, Bartın"
                {...register('address')}
              />
              <Input
                label="İlçe"
                type="text"
                placeholder="Bartın Merkez"
                {...register('district')}
              />
            </div>

            <Input
              label="Instagram kullanıcı adı"
              type="text"
              placeholder="akademi_adi"
              hint="@ işareti olmadan"
              {...register('instagram')}
            />

            <Input
              label="Google Maps URL"
              type="url"
              placeholder="https://goo.gl/maps/..."
              {...register('google_maps_url')}
            />
          </div>
        </Card>

        {/* Hero group */}
        <Card>
          <div className="flex flex-col gap-4">
            <SectionTitle icon={Sparkles}>Anasayfa Hero</SectionTitle>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Başlık"
                type="text"
                placeholder="Gücünü"
                {...register('hero_headline')}
              />
              <Input
                label="Vurgulu Kelime"
                type="text"
                placeholder="Keşfet."
                hint="Kırmızı gradient ile gösterilir"
                {...register('hero_highlight')}
              />
            </div>

            <Textarea
              label="Alt Metin"
              rows={3}
              placeholder="Hero bölümünde başlığın altında gösterilen metin..."
              {...register('hero_subtext')}
            />
          </div>
        </Card>

        {/* Info */}
        <div className="flex items-start gap-2.5 bg-surface-low rounded-md px-3 py-3">
          <Info className="w-4 h-4 text-on-surface/40 shrink-0 mt-0.5" />
          <p className="text-body-sm text-on-surface/60 leading-relaxed">
            Boş bıraktığınız alanlar için varsayılan değerler kullanılır. Telefon/WhatsApp bilgilerinin doğru formatta olduğundan emin olun.
          </p>
        </div>

        {errors.root && (
          <p className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2" role="alert">
            {errors.root.message}
          </p>
        )}

        {isSubmitSuccessful && !errors.root && (
          <p className="text-body-sm text-green-700 bg-green-50 rounded-md px-3 py-2 flex items-center gap-2" role="status">
            <Check className="w-4 h-4" />
            Site içeriği güncellendi. Sayfaları yenileyin.
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="self-start">
          Kaydet
        </Button>
      </form>

      {/* Quick reference icons (just for visual polish) */}
      <div className="hidden">
        <Phone /><MessageCircle /><Mail /><MapPin /><Instagram />
      </div>
    </div>
  )
}

interface SectionTitleProps {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}

function SectionTitle({ icon: Icon, children }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="font-display font-semibold text-title-md text-on-surface">{children}</h2>
    </div>
  )
}

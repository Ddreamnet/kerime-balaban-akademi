import { useEffect } from 'react'
import { useForm, useFieldArray, type Control, type UseFormRegister } from 'react-hook-form'
import {
  Check,
  Info,
  Phone,
  Sparkles,
  BarChart3,
  UserCircle2,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Gift,
  Star,
  CalendarClock,
  ArrowRightCircle,
  Plus,
  Trash2,
  Layers,
  Home,
  GraduationCap,
  Megaphone,
  ShoppingBag,
  Users,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { getSiteContent, updateSiteContent, type SiteContent } from '@/lib/siteContent'
import { useSiteSettings, resolveSiteContent } from '@/hooks/useSiteSettings'

// ─── Form types ──────────────────────────────────────────────────────────

interface StatField {
  value: string
  label: string
}

interface FaqField {
  q: string
  a: string
}

interface CredField {
  value: string
}

interface ParaField {
  value: string
}

interface BenefitField {
  value: string
}

interface ValueField {
  title: string
  body: string
}

interface FeatureField {
  title: string
  body: string
}

interface ScheduleField {
  time: string
  group: string
  note: string
}

interface FormValues {
  // Contact
  phone: string
  whatsapp: string
  email: string
  address: string
  district: string
  instagram: string
  google_maps_url: string

  // Home hero
  hero_headline: string
  hero_highlight: string
  hero_subtext: string
  hero_cta_primary_label: string
  hero_cta_primary_href: string
  hero_cta_secondary_label: string
  hero_cta_secondary_href: string
  home_hero_overline: string

  // Stats
  academy_stats: StatField[]

  // Coach
  coach_name: string
  coach_title: string
  coach_bio: string
  coach_credentials: CredField[]

  // Home sections
  home_features_label: string
  home_features_headline: string
  home_features_highlight: string
  home_features_body: string
  home_features_cards: FeatureField[]

  home_classes_label: string
  home_classes_headline: string
  home_classes_highlight: string
  home_classes_body: string
  home_classes_link_label: string

  home_announcements_label: string
  home_announcements_headline: string
  home_announcements_highlight: string
  home_announcements_body: string

  home_products_label: string
  home_products_headline: string
  home_products_highlight: string
  home_products_body: string

  home_cta_label: string
  home_cta_headline: string
  home_cta_headline_highlight: string
  home_cta_headline_suffix: string
  home_cta_body: string
  home_cta_benefits: BenefitField[]
  home_cta_form_title: string
  home_cta_form_subtitle: string

  // About
  about_hero_headline: string
  about_hero_highlight: string
  about_hero_body: string
  about_story_label: string
  about_story_headline: string
  about_story_highlight: string
  about_story_paragraphs: ParaField[]
  about_coach_label: string
  about_values_label: string
  about_values_headline: string
  about_values_highlight: string
  about_values_body: string
  about_values: ValueField[]
  about_cta_headline: string
  about_cta_body: string
  about_cta_primary_label: string
  about_cta_secondary_label: string

  // Classes page
  classes_hero_label: string
  classes_hero_headline: string
  classes_hero_highlight: string
  classes_hero_body: string
  classes_groups_label: string
  classes_groups_headline: string
  classes_groups_highlight: string
  classes_schedule_label: string
  classes_schedule_headline: string
  classes_schedule_highlight: string
  classes_schedule_body: string
  classes_schedule: ScheduleField[]
  classes_faq_label: string
  classes_faq_headline: string
  classes_faq_highlight: string
  class_faqs: FaqField[]
  classes_cta_headline: string
  classes_cta_body: string
  classes_cta_button_label: string

  // Contact page
  contact_hero_headline: string
  contact_hero_body: string
  contact_hours_days: string
  contact_hours_time: string
  contact_form_label: string
  contact_form_headline: string
  contact_channels_label: string
  contact_channels_headline: string

  // Announcements page
  announcements_hero_label: string
  announcements_hero_headline: string
  announcements_hero_highlight: string
  announcements_hero_body: string

  // Products page
  products_hero_label: string
  products_hero_headline: string
  products_hero_highlight: string
  products_hero_body: string
  products_cta_headline: string
  products_cta_body: string
  products_cta_button_label: string
}

function toForm(content: SiteContent): FormValues {
  const r = resolveSiteContent(content)
  return {
    phone: r.phone,
    whatsapp: r.whatsapp,
    email: r.email,
    address: r.address,
    district: r.district,
    instagram: r.instagram ?? '',
    google_maps_url: r.google_maps_url ?? '',
    hero_headline: r.hero_headline,
    hero_highlight: r.hero_highlight,
    hero_subtext: r.hero_subtext,
    hero_cta_primary_label: r.hero_cta_primary_label,
    hero_cta_primary_href: r.hero_cta_primary_href,
    hero_cta_secondary_label: r.hero_cta_secondary_label,
    hero_cta_secondary_href: r.hero_cta_secondary_href,
    home_hero_overline: r.home_hero_overline,
    academy_stats: r.academy_stats,
    coach_name: r.coach_name,
    coach_title: r.coach_title,
    coach_bio: r.coach_bio,
    coach_credentials: r.coach_credentials.map((value) => ({ value })),
    home_features_label: r.home_features_label,
    home_features_headline: r.home_features_headline,
    home_features_highlight: r.home_features_highlight,
    home_features_body: r.home_features_body,
    home_features_cards: r.home_features_cards,
    home_classes_label: r.home_classes_label,
    home_classes_headline: r.home_classes_headline,
    home_classes_highlight: r.home_classes_highlight,
    home_classes_body: r.home_classes_body,
    home_classes_link_label: r.home_classes_link_label,
    home_announcements_label: r.home_announcements_label,
    home_announcements_headline: r.home_announcements_headline,
    home_announcements_highlight: r.home_announcements_highlight,
    home_announcements_body: r.home_announcements_body,
    home_products_label: r.home_products_label,
    home_products_headline: r.home_products_headline,
    home_products_highlight: r.home_products_highlight,
    home_products_body: r.home_products_body,
    home_cta_label: r.home_cta_label,
    home_cta_headline: r.home_cta_headline,
    home_cta_headline_highlight: r.home_cta_headline_highlight,
    home_cta_headline_suffix: r.home_cta_headline_suffix,
    home_cta_body: r.home_cta_body,
    home_cta_benefits: r.home_cta_benefits.map((value) => ({ value })),
    home_cta_form_title: r.home_cta_form_title,
    home_cta_form_subtitle: r.home_cta_form_subtitle,
    about_hero_headline: r.about_hero_headline,
    about_hero_highlight: r.about_hero_highlight,
    about_hero_body: r.about_hero_body,
    about_story_label: r.about_story_label,
    about_story_headline: r.about_story_headline,
    about_story_highlight: r.about_story_highlight,
    about_story_paragraphs: r.about_story_paragraphs.map((value) => ({ value })),
    about_coach_label: r.about_coach_label,
    about_values_label: r.about_values_label,
    about_values_headline: r.about_values_headline,
    about_values_highlight: r.about_values_highlight,
    about_values_body: r.about_values_body,
    about_values: r.about_values,
    about_cta_headline: r.about_cta_headline,
    about_cta_body: r.about_cta_body,
    about_cta_primary_label: r.about_cta_primary_label,
    about_cta_secondary_label: r.about_cta_secondary_label,
    classes_hero_label: r.classes_hero_label,
    classes_hero_headline: r.classes_hero_headline,
    classes_hero_highlight: r.classes_hero_highlight,
    classes_hero_body: r.classes_hero_body,
    classes_groups_label: r.classes_groups_label,
    classes_groups_headline: r.classes_groups_headline,
    classes_groups_highlight: r.classes_groups_highlight,
    classes_schedule_label: r.classes_schedule_label,
    classes_schedule_headline: r.classes_schedule_headline,
    classes_schedule_highlight: r.classes_schedule_highlight,
    classes_schedule_body: r.classes_schedule_body,
    classes_schedule: r.classes_schedule,
    classes_faq_label: r.classes_faq_label,
    classes_faq_headline: r.classes_faq_headline,
    classes_faq_highlight: r.classes_faq_highlight,
    class_faqs: r.class_faqs,
    classes_cta_headline: r.classes_cta_headline,
    classes_cta_body: r.classes_cta_body,
    classes_cta_button_label: r.classes_cta_button_label,
    contact_hero_headline: r.contact_hero_headline,
    contact_hero_body: r.contact_hero_body,
    contact_hours_days: r.contact_hours_days,
    contact_hours_time: r.contact_hours_time,
    contact_form_label: r.contact_form_label,
    contact_form_headline: r.contact_form_headline,
    contact_channels_label: r.contact_channels_label,
    contact_channels_headline: r.contact_channels_headline,
    announcements_hero_label: r.announcements_hero_label,
    announcements_hero_headline: r.announcements_hero_headline,
    announcements_hero_highlight: r.announcements_hero_highlight,
    announcements_hero_body: r.announcements_hero_body,
    products_hero_label: r.products_hero_label,
    products_hero_headline: r.products_hero_headline,
    products_hero_highlight: r.products_hero_highlight,
    products_hero_body: r.products_hero_body,
    products_cta_headline: r.products_cta_headline,
    products_cta_body: r.products_cta_body,
    products_cta_button_label: r.products_cta_button_label,
  }
}

function trimOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function toPayload(data: FormValues): Partial<SiteContent> {
  const stats = data.academy_stats
    .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
    .filter((s) => s.value !== '' || s.label !== '')
  const creds = data.coach_credentials.map((c) => c.value.trim()).filter((c) => c !== '')
  const paras = data.about_story_paragraphs.map((p) => p.value.trim()).filter((p) => p !== '')
  const faqs = data.class_faqs
    .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
    .filter((f) => f.q !== '' || f.a !== '')
  const homeBenefits = data.home_cta_benefits
    .map((b) => b.value.trim())
    .filter((b) => b !== '')
  const aboutValues = data.about_values
    .map((v) => ({ title: v.title.trim(), body: v.body.trim() }))
    .filter((v) => v.title !== '' || v.body !== '')
  const featureCards = data.home_features_cards
    .map((v) => ({ title: v.title.trim(), body: v.body.trim() }))
    .filter((v) => v.title !== '' || v.body !== '')
  const schedule = data.classes_schedule
    .map((s) => ({ time: s.time.trim(), group: s.group.trim(), note: s.note.trim() }))
    .filter((s) => s.time !== '' || s.group !== '' || s.note !== '')

  return {
    phone: trimOrNull(data.phone),
    whatsapp: trimOrNull(data.whatsapp),
    email: trimOrNull(data.email),
    address: trimOrNull(data.address),
    district: trimOrNull(data.district),
    instagram: trimOrNull(data.instagram),
    google_maps_url: trimOrNull(data.google_maps_url),
    hero_headline: trimOrNull(data.hero_headline),
    hero_highlight: trimOrNull(data.hero_highlight),
    hero_subtext: trimOrNull(data.hero_subtext),
    hero_cta_primary_label: trimOrNull(data.hero_cta_primary_label),
    hero_cta_primary_href: trimOrNull(data.hero_cta_primary_href),
    hero_cta_secondary_label: trimOrNull(data.hero_cta_secondary_label),
    hero_cta_secondary_href: trimOrNull(data.hero_cta_secondary_href),
    home_hero_overline: trimOrNull(data.home_hero_overline),
    academy_stats: stats.length > 0 ? stats : null,
    coach_name: trimOrNull(data.coach_name),
    coach_title: trimOrNull(data.coach_title),
    coach_bio: trimOrNull(data.coach_bio),
    coach_credentials: creds.length > 0 ? creds : null,
    home_features_label: trimOrNull(data.home_features_label),
    home_features_headline: trimOrNull(data.home_features_headline),
    home_features_highlight: trimOrNull(data.home_features_highlight),
    home_features_body: trimOrNull(data.home_features_body),
    home_features_cards: featureCards.length > 0 ? featureCards : null,
    home_classes_label: trimOrNull(data.home_classes_label),
    home_classes_headline: trimOrNull(data.home_classes_headline),
    home_classes_highlight: trimOrNull(data.home_classes_highlight),
    home_classes_body: trimOrNull(data.home_classes_body),
    home_classes_link_label: trimOrNull(data.home_classes_link_label),
    home_announcements_label: trimOrNull(data.home_announcements_label),
    home_announcements_headline: trimOrNull(data.home_announcements_headline),
    home_announcements_highlight: trimOrNull(data.home_announcements_highlight),
    home_announcements_body: trimOrNull(data.home_announcements_body),
    home_products_label: trimOrNull(data.home_products_label),
    home_products_headline: trimOrNull(data.home_products_headline),
    home_products_highlight: trimOrNull(data.home_products_highlight),
    home_products_body: trimOrNull(data.home_products_body),
    home_cta_label: trimOrNull(data.home_cta_label),
    home_cta_headline: trimOrNull(data.home_cta_headline),
    home_cta_headline_highlight: trimOrNull(data.home_cta_headline_highlight),
    home_cta_headline_suffix: trimOrNull(data.home_cta_headline_suffix),
    home_cta_body: trimOrNull(data.home_cta_body),
    home_cta_benefits: homeBenefits.length > 0 ? homeBenefits : null,
    home_cta_form_title: trimOrNull(data.home_cta_form_title),
    home_cta_form_subtitle: trimOrNull(data.home_cta_form_subtitle),
    about_hero_headline: trimOrNull(data.about_hero_headline),
    about_hero_highlight: trimOrNull(data.about_hero_highlight),
    about_hero_body: trimOrNull(data.about_hero_body),
    about_story_label: trimOrNull(data.about_story_label),
    about_story_headline: trimOrNull(data.about_story_headline),
    about_story_highlight: trimOrNull(data.about_story_highlight),
    about_story_paragraphs: paras.length > 0 ? paras : null,
    about_coach_label: trimOrNull(data.about_coach_label),
    about_values_label: trimOrNull(data.about_values_label),
    about_values_headline: trimOrNull(data.about_values_headline),
    about_values_highlight: trimOrNull(data.about_values_highlight),
    about_values_body: trimOrNull(data.about_values_body),
    about_values: aboutValues.length > 0 ? aboutValues : null,
    about_cta_headline: trimOrNull(data.about_cta_headline),
    about_cta_body: trimOrNull(data.about_cta_body),
    about_cta_primary_label: trimOrNull(data.about_cta_primary_label),
    about_cta_secondary_label: trimOrNull(data.about_cta_secondary_label),
    classes_hero_label: trimOrNull(data.classes_hero_label),
    classes_hero_headline: trimOrNull(data.classes_hero_headline),
    classes_hero_highlight: trimOrNull(data.classes_hero_highlight),
    classes_hero_body: trimOrNull(data.classes_hero_body),
    classes_groups_label: trimOrNull(data.classes_groups_label),
    classes_groups_headline: trimOrNull(data.classes_groups_headline),
    classes_groups_highlight: trimOrNull(data.classes_groups_highlight),
    classes_schedule_label: trimOrNull(data.classes_schedule_label),
    classes_schedule_headline: trimOrNull(data.classes_schedule_headline),
    classes_schedule_highlight: trimOrNull(data.classes_schedule_highlight),
    classes_schedule_body: trimOrNull(data.classes_schedule_body),
    classes_schedule: schedule.length > 0 ? schedule : null,
    classes_faq_label: trimOrNull(data.classes_faq_label),
    classes_faq_headline: trimOrNull(data.classes_faq_headline),
    classes_faq_highlight: trimOrNull(data.classes_faq_highlight),
    class_faqs: faqs.length > 0 ? faqs : null,
    classes_cta_headline: trimOrNull(data.classes_cta_headline),
    classes_cta_body: trimOrNull(data.classes_cta_body),
    classes_cta_button_label: trimOrNull(data.classes_cta_button_label),
    contact_hero_headline: trimOrNull(data.contact_hero_headline),
    contact_hero_body: trimOrNull(data.contact_hero_body),
    contact_hours_days: trimOrNull(data.contact_hours_days),
    contact_hours_time: trimOrNull(data.contact_hours_time),
    contact_form_label: trimOrNull(data.contact_form_label),
    contact_form_headline: trimOrNull(data.contact_form_headline),
    contact_channels_label: trimOrNull(data.contact_channels_label),
    contact_channels_headline: trimOrNull(data.contact_channels_headline),
    announcements_hero_label: trimOrNull(data.announcements_hero_label),
    announcements_hero_headline: trimOrNull(data.announcements_hero_headline),
    announcements_hero_highlight: trimOrNull(data.announcements_hero_highlight),
    announcements_hero_body: trimOrNull(data.announcements_hero_body),
    products_hero_label: trimOrNull(data.products_hero_label),
    products_hero_headline: trimOrNull(data.products_hero_headline),
    products_hero_highlight: trimOrNull(data.products_hero_highlight),
    products_hero_body: trimOrNull(data.products_hero_body),
    products_cta_headline: trimOrNull(data.products_cta_headline),
    products_cta_body: trimOrNull(data.products_cta_body),
    products_cta_button_label: trimOrNull(data.products_cta_button_label),
  }
}

const EMPTY_FORM: FormValues = toForm({
  phone: null, whatsapp: null, email: null, address: null, district: null, instagram: null,
  hero_headline: null, hero_highlight: null, hero_subtext: null, hero_bg_url: null,
  hero_cta_primary_label: null, hero_cta_primary_href: null,
  hero_cta_secondary_label: null, hero_cta_secondary_href: null,
  home_hero_overline: null, google_maps_url: null,
  academy_stats: null, coach_name: null, coach_title: null, coach_bio: null, coach_credentials: null,
  about_hero_headline: null, about_hero_highlight: null, about_hero_body: null,
  about_story_label: null, about_story_headline: null, about_story_highlight: null,
  about_story_paragraphs: null, about_founded_year: null,
  about_coach_label: null, about_values_label: null, about_values_headline: null,
  about_values_highlight: null, about_values_body: null,
  contact_hero_headline: null, contact_hero_body: null, contact_hours_days: null, contact_hours_time: null,
  contact_form_label: null, contact_form_headline: null,
  contact_channels_label: null, contact_channels_headline: null,
  class_faqs: null,
  home_cta_label: null, home_cta_headline: null, home_cta_headline_highlight: null,
  home_cta_headline_suffix: null, home_cta_body: null, home_cta_benefits: null,
  home_cta_form_title: null, home_cta_form_subtitle: null,
  home_features_label: null, home_features_headline: null, home_features_highlight: null,
  home_features_body: null, home_features_cards: null,
  home_classes_label: null, home_classes_headline: null, home_classes_highlight: null,
  home_classes_body: null, home_classes_link_label: null,
  home_announcements_label: null, home_announcements_headline: null,
  home_announcements_highlight: null, home_announcements_body: null,
  home_products_label: null, home_products_headline: null,
  home_products_highlight: null, home_products_body: null,
  about_values: null, about_cta_headline: null, about_cta_body: null,
  about_cta_primary_label: null, about_cta_secondary_label: null,
  classes_hero_label: null, classes_hero_headline: null, classes_hero_highlight: null,
  classes_hero_body: null, classes_groups_label: null, classes_groups_headline: null,
  classes_groups_highlight: null, classes_schedule_label: null, classes_schedule_headline: null,
  classes_schedule_highlight: null, classes_schedule_body: null,
  classes_faq_label: null, classes_faq_headline: null, classes_faq_highlight: null,
  classes_schedule: null, classes_cta_headline: null, classes_cta_body: null,
  classes_cta_button_label: null,
  announcements_hero_label: null, announcements_hero_headline: null,
  announcements_hero_highlight: null, announcements_hero_body: null,
  products_hero_label: null, products_hero_headline: null, products_hero_highlight: null,
  products_hero_body: null, products_cta_headline: null, products_cta_body: null,
  products_cta_button_label: null,
})

/**
 * Admin: Site Content — admin-editable public settings, grouped by page.
 */
export function AdminSiteContentPage() {
  const { refresh } = useSiteSettings()

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
  } = useForm<FormValues>({ defaultValues: EMPTY_FORM })

  useEffect(() => {
    const load = async () => {
      const content = await getSiteContent()
      reset(toForm(content))
    }
    void load()
  }, [reset])

  const onSubmit = async (data: FormValues) => {
    const { error } = await updateSiteContent(toPayload(data))
    if (error) {
      setError('root', { message: error })
      return
    }
    await refresh()
    const content = await getSiteContent()
    reset(toForm(content))
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">Site İçeriği</h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          Anasayfa, hakkımızda, iletişim, dersler, duyurular ve ürünler sayfalarındaki tüm metinleri buradan düzenleyin. Değişiklikler kaydettiğiniz anda siteye yansır.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10" noValidate>

        {/* ══════ GENEL ══════════════════════════════════════════════════ */}
        <PageSection icon={Layers} title="Genel" caption="Birden çok sayfada ortak kullanılan içerikler">

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Phone}>İletişim Bilgileri</SectionTitle>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Telefon" type="tel" placeholder="+90 5XX XXX XX XX" {...register('phone')} />
                <Input
                  label="WhatsApp Numarası"
                  type="tel"
                  placeholder="+905XXXXXXXXX"
                  hint="Boşluksuz, ülke koduyla"
                  {...register('whatsapp')}
                />
              </div>

              <Input label="E-posta" type="email" placeholder="info@akademi.com" {...register('email')} />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Adres" type="text" placeholder="Bartın Merkez, Bartın" {...register('address')} />
                <Input label="İlçe" type="text" placeholder="Bartın Merkez" {...register('district')} />
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

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={BarChart3}>Akademi İstatistikleri</SectionTitle>
              <p className="text-body-sm text-on-surface/60 -mt-2">
                Anasayfa hero, hakkımızda ve iletişim sayfasında görünür. Genelde 4 kalem.
              </p>
              <StatsList control={control} register={register} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={UserCircle2}>Antrenör Bilgileri</SectionTitle>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Ad Soyad" type="text" placeholder="Kerime Balaban" {...register('coach_name')} />
                <Input
                  label="Ünvan"
                  type="text"
                  placeholder="Baş Antrenör · 3. Dan Siyah Kuşak"
                  {...register('coach_title')}
                />
              </div>

              <Textarea
                label="Biyografi"
                rows={4}
                placeholder="Antrenör tanıtım paragrafı..."
                {...register('coach_bio')}
              />

              <CredentialsList control={control} register={register} />
            </div>
          </Card>

        </PageSection>

        {/* ══════ ANASAYFA ══════════════════════════════════════════════ */}
        <PageSection icon={Home} title="Anasayfa" caption="/">

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Sparkles}>Hero Bölümü</SectionTitle>

              <Input
                label="Üst Etiket (Overline)"
                type="text"
                placeholder="Geleneksel Sanat, Modern Güç"
                {...register('home_hero_overline')}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Başlık" type="text" placeholder="Gücünü" {...register('hero_headline')} />
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

              <div className="flex flex-col gap-3 pt-2">
                <p className="text-label-sm text-on-surface/60 uppercase tracking-wider">Birincil CTA (kırmızı buton)</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Buton Metni"
                    type="text"
                    placeholder="Ücretsiz Deneme Dersi Al"
                    {...register('hero_cta_primary_label')}
                  />
                  <Input
                    label="Link"
                    type="text"
                    placeholder="/iletisim"
                    hint="Dahili yol veya https://..."
                    {...register('hero_cta_primary_href')}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-label-sm text-on-surface/60 uppercase tracking-wider">İkincil CTA (outline buton)</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Buton Metni"
                    type="text"
                    placeholder="Dersleri İncele"
                    {...register('hero_cta_secondary_label')}
                  />
                  <Input
                    label="Link"
                    type="text"
                    placeholder="/dersler"
                    {...register('hero_cta_secondary_href')}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Zap}>"Neden KBA?" Bölümü</SectionTitle>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Neden KBA?" {...register('home_features_label')} />
                <Input label="Başlık" type="text" placeholder="Fark yaratan" {...register('home_features_headline')} />
                <Input label="Vurgu" type="text" placeholder="akademi." {...register('home_features_highlight')} />
              </div>

              <Textarea
                label="Açıklama"
                rows={2}
                placeholder="Taekwondo sadece teknik değil..."
                {...register('home_features_body')}
              />

              <FeaturesList control={control} register={register} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={GraduationCap}>Ders Programı Önizlemesi</SectionTitle>
              <p className="text-body-sm text-on-surface/60 -mt-2">
                Anasayfada gösterilen ders programı özeti.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Ders Programı" {...register('home_classes_label')} />
                <Input label="Başlık" type="text" placeholder="Haftada 3 gün," {...register('home_classes_headline')} />
                <Input label="Vurgu" type="text" placeholder="4 farklı grup." {...register('home_classes_highlight')} />
              </div>

              <Textarea
                label="Açıklama"
                rows={2}
                placeholder="Yaş ve seviyeye göre..."
                {...register('home_classes_body')}
              />

              <Input
                label="Link Metni"
                type="text"
                placeholder="Tüm programı gör"
                {...register('home_classes_link_label')}
              />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Megaphone}>Duyurular Önizlemesi</SectionTitle>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Son Duyurular" {...register('home_announcements_label')} />
                <Input label="Başlık" type="text" placeholder="Akademiden" {...register('home_announcements_headline')} />
                <Input label="Vurgu" type="text" placeholder="haberler." {...register('home_announcements_highlight')} />
              </div>

              <Textarea
                label="Açıklama"
                rows={2}
                placeholder="Kuşak sınavları, etkinlikler..."
                {...register('home_announcements_body')}
              />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={ShoppingBag}>Ürünler Önizlemesi</SectionTitle>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Ekipmanlar" {...register('home_products_label')} />
                <Input label="Başlık" type="text" placeholder="İhtiyacınız olan" {...register('home_products_headline')} />
                <Input label="Vurgu" type="text" placeholder="her şey." {...register('home_products_highlight')} />
              </div>

              <Textarea
                label="Açıklama"
                rows={2}
                placeholder="Akademimizden temin edebileceğiniz..."
                {...register('home_products_body')}
              />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Gift}>"Ücretsiz Deneme" Bölümü</SectionTitle>
              <p className="text-body-sm text-on-surface/60 -mt-2">
                Anasayfanın alt kısmındaki formlu CTA.
              </p>

              <Input label="Etiket" type="text" placeholder="Ücretsiz Deneme" {...register('home_cta_label')} />

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Başlık" type="text" placeholder="İlk dersinizi" {...register('home_cta_headline')} />
                <Input label="Vurgu" type="text" placeholder="ücretsiz" hint="Kırmızı italik" {...register('home_cta_headline_highlight')} />
                <Input label="Devam" type="text" placeholder="deneyin." {...register('home_cta_headline_suffix')} />
              </div>

              <Textarea label="Açıklama" rows={3} placeholder="Uzun paragraf..." {...register('home_cta_body')} />

              <BenefitsList control={control} register={register} />

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <Input label="Form Başlığı" type="text" placeholder="Yer Ayırtın" {...register('home_cta_form_title')} />
                <Input label="Form Alt Metni" type="text" placeholder="Bilgilerinizi bırakın..." {...register('home_cta_form_subtitle')} />
              </div>
            </div>
          </Card>

        </PageSection>

        {/* ══════ HAKKIMIZDA ════════════════════════════════════════════ */}
        <PageSection icon={BookOpen} title="Hakkımızda" caption="/hakkimizda">

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Sparkles}>Üst Başlık (Hero)</SectionTitle>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Başlık" type="text" placeholder="Kim olduğumuzu" {...register('about_hero_headline')} />
                <Input label="Vurgu" type="text" placeholder="tanıyın." {...register('about_hero_highlight')} />
              </div>

              <Textarea label="Açıklama" rows={2} placeholder="Açıklama..." {...register('about_hero_body')} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={BookOpen}>Hikâyemiz Bölümü</SectionTitle>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Hikayemiz" {...register('about_story_label')} />
                <Input label="Başlık" type="text" placeholder="Bartın'ın ilk" {...register('about_story_headline')} />
                <Input label="Vurgu" type="text" placeholder="taekwondo akademisi." {...register('about_story_highlight')} />
              </div>

              <ParagraphsList control={control} register={register} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={UserCircle2}>Antrenör Bölümü Başlığı</SectionTitle>
              <Input
                label="Etiket"
                type="text"
                placeholder="Antrenörümüz"
                hint="Antrenörün adının üstünde görünür"
                {...register('about_coach_label')}
              />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Star}>Değerlerimiz — Bölüm Başlığı</SectionTitle>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Değerlerimiz" {...register('about_values_label')} />
                <Input label="Başlık" type="text" placeholder="Temeller" {...register('about_values_headline')} />
                <Input label="Vurgu" type="text" placeholder="sağlam." {...register('about_values_highlight')} />
              </div>

              <Textarea
                label="Alt Açıklama"
                rows={2}
                placeholder="Her antrenmanın arkasında dört temel değer yatar."
                {...register('about_values_body')}
              />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Star}>Değerlerimiz — Kartlar</SectionTitle>
              <p className="text-body-sm text-on-surface/60 -mt-2">
                4 kart önerilir — ikonlar sıralamaya göre otomatik seçilir.
              </p>
              <ValuesList control={control} register={register} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={ArrowRightCircle}>Alt CTA</SectionTitle>
              <Input label="Başlık" type="text" placeholder="Ailemize katılmaya hazır mısınız?" {...register('about_cta_headline')} />
              <Textarea label="Alt Metin" rows={2} placeholder="İlk ücretsiz ders için..." {...register('about_cta_body')} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Birincil Buton" type="text" placeholder="Bize Ulaşın" hint="→ /iletisim" {...register('about_cta_primary_label')} />
                <Input label="İkincil Buton" type="text" placeholder="Dersleri İncele" hint="→ /dersler" {...register('about_cta_secondary_label')} />
              </div>
            </div>
          </Card>

        </PageSection>

        {/* ══════ DERSLER ════════════════════════════════════════════════ */}
        <PageSection icon={GraduationCap} title="Dersler" caption="/dersler">

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Sparkles}>Üst Başlık (Hero)</SectionTitle>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Ders Programı" {...register('classes_hero_label')} />
                <Input label="Başlık" type="text" placeholder="Seviyene uygun" {...register('classes_hero_headline')} />
                <Input label="Vurgu" type="text" placeholder="grubunu bul." {...register('classes_hero_highlight')} />
              </div>
              <Textarea label="Açıklama" rows={2} placeholder="Miniklerden ileri seviyeye..." {...register('classes_hero_body')} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Users}>Gruplarımız — Bölüm Başlığı</SectionTitle>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Gruplarımız" {...register('classes_groups_label')} />
                <Input label="Başlık" type="text" placeholder="4 grup," {...register('classes_groups_headline')} />
                <Input label="Vurgu" type="text" placeholder="her yaşa uygun." {...register('classes_groups_highlight')} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={CalendarClock}>Günlük Program — Bölüm Başlığı</SectionTitle>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Günlük Program" {...register('classes_schedule_label')} />
                <Input label="Başlık" type="text" placeholder="Bir günde" {...register('classes_schedule_headline')} />
                <Input label="Vurgu" type="text" placeholder="neler oluyor?" {...register('classes_schedule_highlight')} />
              </div>
              <Textarea label="Açıklama" rows={2} placeholder="Her antrenman günü..." {...register('classes_schedule_body')} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={CalendarClock}>Günlük Program — Zaman Çizelgesi</SectionTitle>
              <ScheduleList control={control} register={register} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={HelpCircle}>Sıkça Sorulan Sorular — Bölüm Başlığı</SectionTitle>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Sıkça Sorulan Sorular" {...register('classes_faq_label')} />
                <Input label="Başlık" type="text" placeholder="Merak" {...register('classes_faq_headline')} />
                <Input label="Vurgu" type="text" placeholder="ettikleriniz." {...register('classes_faq_highlight')} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={HelpCircle}>Sıkça Sorulan Sorular — Sorular</SectionTitle>
              <FaqList control={control} register={register} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={ArrowRightCircle}>Alt CTA</SectionTitle>
              <Input label="Başlık" type="text" placeholder="Hangi grup sana uygun?" {...register('classes_cta_headline')} />
              <Textarea label="Alt Metin" rows={2} placeholder="Bize ulaşın..." {...register('classes_cta_body')} />
              <Input label="Buton Metni" type="text" placeholder="İletişime Geç" hint="→ /iletisim" {...register('classes_cta_button_label')} />
            </div>
          </Card>

        </PageSection>

        {/* ══════ İLETİŞİM ══════════════════════════════════════════════ */}
        <PageSection icon={MessageSquare} title="İletişim" caption="/iletisim">

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Sparkles}>Üst Başlık (Hero)</SectionTitle>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Üst Başlık" type="text" placeholder="Hep buradayız." {...register('contact_hero_headline')} />
                <Input label="Antrenman Günleri" type="text" placeholder="Pazartesi, Çarşamba, Cuma" {...register('contact_hours_days')} />
              </div>
              <Textarea label="Açıklama" rows={2} placeholder="Soru, kayıt ya da bilgi için..." {...register('contact_hero_body')} />
              <Input label="Antrenman Saatleri" type="text" placeholder="15:30 – 20:30" {...register('contact_hours_time')} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={MessageSquare}>Form Bölümü Başlığı</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Etiket" type="text" placeholder="Mesaj Gönderin" {...register('contact_form_label')} />
                <Input label="Başlık" type="text" placeholder="Bize yazın." {...register('contact_form_headline')} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Phone}>Kanallar Bölümü Başlığı</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Etiket" type="text" placeholder="Ulaşın" {...register('contact_channels_label')} />
                <Input label="Başlık" type="text" placeholder="Direkt iletişim." {...register('contact_channels_headline')} />
              </div>
            </div>
          </Card>

        </PageSection>

        {/* ══════ DUYURULAR ═════════════════════════════════════════════ */}
        <PageSection icon={Megaphone} title="Duyurular" caption="/duyurular">

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Sparkles}>Üst Başlık (Hero)</SectionTitle>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Duyurular" {...register('announcements_hero_label')} />
                <Input label="Başlık" type="text" placeholder="Akademiden" {...register('announcements_hero_headline')} />
                <Input label="Vurgu" type="text" placeholder="son haberler." {...register('announcements_hero_highlight')} />
              </div>
              <Textarea label="Açıklama" rows={2} placeholder="Kuşak sınavları, etkinlikler..." {...register('announcements_hero_body')} />
            </div>
          </Card>

        </PageSection>

        {/* ══════ ÜRÜNLER ═══════════════════════════════════════════════ */}
        <PageSection icon={ShoppingBag} title="Ürünler" caption="/urunler">

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={Sparkles}>Üst Başlık (Hero)</SectionTitle>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Etiket" type="text" placeholder="Ekipmanlarımız" {...register('products_hero_label')} />
                <Input label="Başlık" type="text" placeholder="Doğru ekipman," {...register('products_hero_headline')} />
                <Input label="Vurgu" type="text" placeholder="doğru başlangıç." {...register('products_hero_highlight')} />
              </div>
              <Textarea label="Açıklama" rows={2} placeholder="Taekwondo için ihtiyaç duyduğunuz..." {...register('products_hero_body')} />
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <SectionTitle icon={ArrowRightCircle}>Alt CTA</SectionTitle>
              <Input label="Başlık" type="text" placeholder="Hangi ekipmanı seçmeli?" {...register('products_cta_headline')} />
              <Textarea label="Alt Metin" rows={2} placeholder="Deneyim seviyenize ve grubunuza göre..." {...register('products_cta_body')} />
              <Input label="Buton Metni" type="text" placeholder="WhatsApp'tan Sor" {...register('products_cta_button_label')} />
            </div>
          </Card>

        </PageSection>

        {/* ── Footer actions ─────────────────────────────────────────── */}

        <div className="flex items-start gap-2.5 bg-surface-low rounded-md px-3 py-3">
          <Info className="w-4 h-4 text-on-surface/40 shrink-0 mt-0.5" />
          <p className="text-body-sm text-on-surface/60 leading-relaxed">
            Alanlar şu anda sitede gösterilen varsayılan değerlerle dolduruldu — istediğinizi düzenleyip kaydedebilirsiniz. Bir alanı veya listeyi tamamen boşaltırsanız fabrika ayarları yeniden devreye girer.
          </p>
        </div>

        {errors.root && (
          <p className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2" role="alert">
            {errors.root.message}
          </p>
        )}

        {isSubmitSuccessful && !errors.root && !isDirty && (
          <p className="text-body-sm text-green-700 bg-green-50 rounded-md px-3 py-2 flex items-center gap-2" role="status">
            <Check className="w-4 h-4" />
            Site içeriği güncellendi.
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="self-start sticky bottom-4 shadow-ambient-lg">
          Kaydet
        </Button>
      </form>
    </div>
  )
}

// ─── Page-level grouping header ─────────────────────────────────────────

interface PageSectionProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  caption?: string
  children: React.ReactNode
}

function PageSection({ icon: Icon, title, caption, children }: PageSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-surface-low pb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-primary-glow/40">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <h2 className="font-display font-bold text-title-lg text-on-surface">{title}</h2>
          {caption && (
            <span className="text-label-sm text-on-surface/40 font-mono">{caption}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

// ─── Repeatable field lists ──────────────────────────────────────────────

interface ListProps {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
}

function StatsList({ control, register }: ListProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'academy_stats' })
  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="text-body-sm text-on-surface/50 italic">Henüz istatistik yok — varsayılanlar gösteriliyor.</p>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2 items-end">
          <div className="flex-1 grid grid-cols-[120px_1fr] gap-2">
            <Input
              label={i === 0 ? 'Değer' : undefined}
              type="text"
              placeholder="200+"
              {...register(`academy_stats.${i}.value`)}
            />
            <Input
              label={i === 0 ? 'Etiket' : undefined}
              type="text"
              placeholder="Aktif Öğrenci"
              {...register(`academy_stats.${i}.label`)}
            />
          </div>
          <RemoveButton onClick={() => remove(i)} />
        </div>
      ))}
      <AddButton onClick={() => append({ value: '', label: '' })}>İstatistik ekle</AddButton>
    </div>
  )
}

function CredentialsList({ control, register }: ListProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'coach_credentials' })
  return (
    <div className="flex flex-col gap-3">
      <p className="text-label-sm text-on-surface/60 uppercase tracking-wider">Uzmanlık / Sertifikalar</p>
      {fields.length === 0 && (
        <p className="text-body-sm text-on-surface/50 italic">Henüz sertifika yok — varsayılanlar gösteriliyor.</p>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="3. Dan Siyah Kuşak"
              {...register(`coach_credentials.${i}.value`)}
            />
          </div>
          <RemoveButton onClick={() => remove(i)} />
        </div>
      ))}
      <AddButton onClick={() => append({ value: '' })}>Sertifika ekle</AddButton>
    </div>
  )
}

function ParagraphsList({ control, register }: ListProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'about_story_paragraphs' })
  return (
    <div className="flex flex-col gap-3">
      <p className="text-label-sm text-on-surface/60 uppercase tracking-wider">Paragraflar</p>
      {fields.length === 0 && (
        <p className="text-body-sm text-on-surface/50 italic">Henüz paragraf yok — varsayılanlar gösteriliyor.</p>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2 items-start">
          <div className="flex-1">
            <Textarea
              rows={3}
              placeholder="Paragraf metni..."
              {...register(`about_story_paragraphs.${i}.value`)}
            />
          </div>
          <div className="pt-2">
            <RemoveButton onClick={() => remove(i)} />
          </div>
        </div>
      ))}
      <AddButton onClick={() => append({ value: '' })}>Paragraf ekle</AddButton>
    </div>
  )
}

function BenefitsList({ control, register }: ListProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'home_cta_benefits' })
  return (
    <div className="flex flex-col gap-3">
      <p className="text-label-sm text-on-surface/60 uppercase tracking-wider">Faydalar listesi</p>
      {fields.length === 0 && (
        <p className="text-body-sm text-on-surface/50 italic">Henüz fayda yok — varsayılanlar gösteriliyor.</p>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="İlk ders tamamen ücretsiz"
              {...register(`home_cta_benefits.${i}.value`)}
            />
          </div>
          <RemoveButton onClick={() => remove(i)} />
        </div>
      ))}
      <AddButton onClick={() => append({ value: '' })}>Fayda ekle</AddButton>
    </div>
  )
}

function FeaturesList({ control, register }: ListProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'home_features_cards' })
  return (
    <div className="flex flex-col gap-4">
      <p className="text-label-sm text-on-surface/60 uppercase tracking-wider">Fayda Kartları</p>
      {fields.length === 0 && (
        <p className="text-body-sm text-on-surface/50 italic">Henüz kart yok — varsayılanlar gösteriliyor.</p>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="flex flex-col gap-2 p-3 bg-surface-low rounded-md">
          <div className="flex gap-2 items-start">
            <div className="flex-1 flex flex-col gap-2">
              <Input
                label={`Kart ${i + 1} — Başlık`}
                type="text"
                placeholder="Güvenli Ortam"
                {...register(`home_features_cards.${i}.title`)}
              />
              <Textarea
                label="Açıklama"
                rows={2}
                placeholder="Açıklama..."
                {...register(`home_features_cards.${i}.body`)}
              />
            </div>
            <div className="pt-7">
              <RemoveButton onClick={() => remove(i)} />
            </div>
          </div>
        </div>
      ))}
      <AddButton onClick={() => append({ title: '', body: '' })}>Kart ekle</AddButton>
    </div>
  )
}

function ValuesList({ control, register }: ListProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'about_values' })
  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <p className="text-body-sm text-on-surface/50 italic">Henüz değer yok — varsayılanlar gösteriliyor.</p>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="flex flex-col gap-2 p-3 bg-surface-low rounded-md">
          <div className="flex gap-2 items-start">
            <div className="flex-1 flex flex-col gap-2">
              <Input
                label={`Değer ${i + 1} — Başlık`}
                type="text"
                placeholder="Disiplin"
                {...register(`about_values.${i}.title`)}
              />
              <Textarea
                label="Açıklama"
                rows={2}
                placeholder="Her antrenman, hayatın her alanında..."
                {...register(`about_values.${i}.body`)}
              />
            </div>
            <div className="pt-7">
              <RemoveButton onClick={() => remove(i)} />
            </div>
          </div>
        </div>
      ))}
      <AddButton onClick={() => append({ title: '', body: '' })}>Değer ekle</AddButton>
    </div>
  )
}

function ScheduleList({ control, register }: ListProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'classes_schedule' })
  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="text-body-sm text-on-surface/50 italic">Henüz saat dilimi yok — varsayılanlar gösteriliyor.</p>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2 items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-[150px_1fr_140px] gap-2">
            <Input
              label={i === 0 ? 'Saat' : undefined}
              type="text"
              placeholder="15:30 – 16:30"
              {...register(`classes_schedule.${i}.time`)}
            />
            <Input
              label={i === 0 ? 'Grup' : undefined}
              type="text"
              placeholder="Minikler Grubu"
              {...register(`classes_schedule.${i}.group`)}
            />
            <Input
              label={i === 0 ? 'Not' : undefined}
              type="text"
              placeholder="5–7 yaş"
              {...register(`classes_schedule.${i}.note`)}
            />
          </div>
          <RemoveButton onClick={() => remove(i)} />
        </div>
      ))}
      <AddButton onClick={() => append({ time: '', group: '', note: '' })}>Saat dilimi ekle</AddButton>
    </div>
  )
}

function FaqList({ control, register }: ListProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'class_faqs' })
  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <p className="text-body-sm text-on-surface/50 italic">Henüz soru yok — varsayılanlar gösteriliyor.</p>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="flex flex-col gap-2 p-3 bg-surface-low rounded-md">
          <div className="flex gap-2 items-start">
            <div className="flex-1 flex flex-col gap-2">
              <Input
                label={`Soru ${i + 1}`}
                type="text"
                placeholder="Başlamak için hangi ekipman gereklidir?"
                {...register(`class_faqs.${i}.q`)}
              />
              <Textarea
                label="Cevap"
                rows={3}
                placeholder="Cevap metni..."
                {...register(`class_faqs.${i}.a`)}
              />
            </div>
            <div className="pt-7">
              <RemoveButton onClick={() => remove(i)} />
            </div>
          </div>
        </div>
      ))}
      <AddButton onClick={() => append({ q: '', a: '' })}>Soru ekle</AddButton>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 self-start px-3 py-1.5 rounded-md text-body-sm font-semibold text-primary hover:bg-primary-container transition-colors"
    >
      <Plus className="w-4 h-4" />
      {children}
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Kaldır"
      className="flex items-center justify-center w-10 h-10 rounded-md text-on-surface/40 hover:text-primary hover:bg-primary-container/50 transition-colors shrink-0"
    >
      <Trash2 className="w-4 h-4" />
    </button>
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
      <h3 className="font-display font-semibold text-title-md text-on-surface">{children}</h3>
    </div>
  )
}

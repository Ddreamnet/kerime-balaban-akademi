import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getSiteContent,
  type SiteContent,
  SITE_CONTENT_DEFAULTS,
  type StatItem,
  type FaqItem,
  type ValueCardItem,
  type ScheduleSlot,
  type FeatureCardItem,
} from '@/lib/siteContent'
import { academyInfo, contactLinks as staticContactLinks } from '@/data/academyInfo'
import { whatsappUrl } from '@/utils/format'

const DEFAULT_ACADEMY_STATS: StatItem[] = [
  { value: '200+', label: 'Aktif Öğrenci' },
  { value: '7+', label: 'Yıllık Deneyim' },
  { value: '3', label: 'Antrenman Günü' },
  { value: '15+', label: 'Şampiyon Sporcu' },
]

const DEFAULT_COACH_CREDENTIALS = [
  '3. Dan Siyah Kuşak',
  'Ulusal Taekwondo Şampiyonu',
  '10+ Yıl Öğretim Deneyimi',
  'Milli Takım Antrenörü Sertifikası',
]

const DEFAULT_ABOUT_STORY_PARAGRAPHS = [
  "Kerime Balaban Akademi, 2018 yılında Bartın Merkez'de kapılarını açtı. Kuruluşumuzdan bu yana yüzlerce çocuğa taekwondo disiplinini sevdirdik, onları güvenli ve destekleyici bir ortamda geliştirdik.",
  'Akademimiz; sadece teknik öğreten bir spor okulu değil, karakter inşa eden bir topluluktur. Öğrencilerimizi sporcu kimliğinin ötesinde, saygılı, kararlı ve özgüvenli bireyler olarak yetiştirmeyi amaçlıyoruz.',
  'Haftada 3 gün, 4 farklı grup düzeyiyle 5 yaşından itibaren her yaştan sporcu akademimizde yer bulabilir.',
]

const DEFAULT_HOME_CTA_BENEFITS = [
  'İlk ders tamamen ücretsiz',
  'Kayıt için taahhüt gerekmez',
  'Ekipman zorunluluğu yok',
  'Yaş ve seviyeye uygun grup',
]

const DEFAULT_ABOUT_VALUES: ValueCardItem[] = [
  {
    title: 'Disiplin',
    body: 'Her antrenman, hayatın her alanında işe yarayacak öz disiplin becerisi kazandırır.',
  },
  {
    title: 'Saygı',
    body: 'Antrenör, öğrenci ve ebeveyn ilişkisi daima saygı temelli kurulur.',
  },
  {
    title: 'Kararlılık',
    body: 'Her öğrencinin hedefi ayrıdır; hedefe ulaşma yolunda kararlı bir yol çizilir.',
  },
  {
    title: 'Tutku',
    body: "Taekwondo'ya duyduğumuz tutku, antrenmanlarımızdaki enerjiye yansır.",
  },
]

const DEFAULT_CLASSES_SCHEDULE: ScheduleSlot[] = [
  { time: '15:30 – 16:30', group: 'Minikler Grubu', note: '5–7 yaş' },
  { time: '16:30 – 17:30', group: 'Başlangıç Grubu', note: '8–12 yaş' },
  { time: '17:30 – 19:00', group: 'Orta Seviye Grubu', note: '10–15 yaş' },
  { time: '19:00 – 20:30', group: 'İleri Seviye Grubu', note: '13+ yaş' },
]

const DEFAULT_CLASS_FAQS: FaqItem[] = [
  {
    q: 'Başlamak için hangi ekipman gereklidir?',
    a: 'İlk derse spor kıyafetiyle gelebilirsiniz. Kayıt sonrası doboku ve temel koruyucu ekipman hakkında bilgi verilir.',
  },
  {
    q: 'Kaç yaşından itibaren başlayabilir?',
    a: 'Minikler grubumuz 5 yaşından itibaren çocukları kabul etmektedir. Üst gruplar için minimum yaş koşulları ilgili grup kartında belirtilmiştir.',
  },
  {
    q: 'Haftada kaç gün antrenman yapılıyor?',
    a: 'Tüm gruplar Pazartesi, Çarşamba ve Cuma günleri antrenman yapar. Toplamda haftada 3 gündür.',
  },
  {
    q: 'Kuşak sınavları ne zaman yapılıyor?',
    a: 'Kuşak sınavları yılda yaklaşık 3 kez, antrenörün belirlediği tarihlerde gerçekleştirilir. Duyurular sayfamızdan takip edebilirsiniz.',
  },
]

const DEFAULT_HOME_FEATURES_CARDS: FeatureCardItem[] = [
  {
    title: 'Güvenli Ortam',
    body: 'Yumuşak zeminli, temiz ve denetimli salonumuz çocuğunuzun güvenliğini ön planda tutar.',
  },
  {
    title: 'Uzman Antrenör',
    body: '10+ yıllık deneyim ve ulusal düzeyde yarışma geçmişiyle alanında uzman kadro.',
  },
  {
    title: 'Küçük Gruplar',
    body: 'Gruplarımız her öğrencinin bireysel ilerlemesini takip edebilecek sayıda tutulur.',
  },
  {
    title: 'Hedef Odaklı',
    body: 'Kuşak sınavları, turnuvalar ve gösteriler ile öğrencilerin kendilerini test etmesi sağlanır.',
  },
]

/**
 * Resolved site settings = DB override merged with static fallbacks.
 * If DB says null/empty, we use the values from src/data/academyInfo.ts or sensible defaults.
 */
export interface ResolvedSiteSettings {
  // Contact
  phone: string
  whatsapp: string
  email: string
  address: string
  district: string
  instagram: string | undefined

  // Home hero
  hero_headline: string
  hero_highlight: string
  hero_subtext: string
  hero_bg_url: string | undefined
  hero_cta_primary_label: string
  hero_cta_primary_href: string
  hero_cta_secondary_label: string
  hero_cta_secondary_href: string
  home_hero_overline: string

  google_maps_url: string | undefined

  // Stats
  academy_stats: StatItem[]

  // Coach
  coach_name: string
  coach_title: string
  coach_bio: string
  coach_credentials: string[]

  // About
  about_hero_headline: string
  about_hero_highlight: string
  about_hero_body: string
  about_story_label: string
  about_story_headline: string
  about_story_highlight: string
  about_story_paragraphs: string[]
  about_founded_year: number
  about_coach_label: string
  about_values_label: string
  about_values_headline: string
  about_values_highlight: string
  about_values_body: string

  // Contact
  contact_hero_headline: string
  contact_hero_body: string
  contact_hours_days: string
  contact_hours_time: string
  contact_form_label: string
  contact_form_headline: string
  contact_channels_label: string
  contact_channels_headline: string

  // FAQs
  class_faqs: FaqItem[]

  // Home CTA section
  home_cta_label: string
  home_cta_headline: string
  home_cta_headline_highlight: string
  home_cta_headline_suffix: string
  home_cta_body: string
  home_cta_benefits: string[]
  home_cta_form_title: string
  home_cta_form_subtitle: string

  // Home features/value-prop
  home_features_label: string
  home_features_headline: string
  home_features_highlight: string
  home_features_body: string
  home_features_cards: FeatureCardItem[]

  // Home classes preview
  home_classes_label: string
  home_classes_headline: string
  home_classes_highlight: string
  home_classes_body: string
  home_classes_link_label: string

  // Home announcements preview
  home_announcements_label: string
  home_announcements_headline: string
  home_announcements_highlight: string
  home_announcements_body: string

  // Home products preview
  home_products_label: string
  home_products_headline: string
  home_products_highlight: string
  home_products_body: string

  // About values + bottom CTA
  about_values: ValueCardItem[]
  about_cta_headline: string
  about_cta_body: string
  about_cta_primary_label: string
  about_cta_secondary_label: string

  // Classes page hero + sections
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
  classes_faq_label: string
  classes_faq_headline: string
  classes_faq_highlight: string

  // Classes schedule + CTA
  classes_schedule: ScheduleSlot[]
  classes_cta_headline: string
  classes_cta_body: string
  classes_cta_button_label: string

  // Announcements hero
  announcements_hero_label: string
  announcements_hero_headline: string
  announcements_hero_highlight: string
  announcements_hero_body: string

  // Products hero + bottom CTA
  products_hero_label: string
  products_hero_headline: string
  products_hero_highlight: string
  products_hero_body: string
  products_cta_headline: string
  products_cta_body: string
  products_cta_button_label: string

  // Derived
  whatsappLink: string
  phoneLink: string
  instagramLink: string | undefined

  refresh: () => Promise<void>
}

function nonEmpty<T>(value: T[] | null | undefined, fallback: T[]): T[] {
  if (!value || value.length === 0) return fallback
  return value
}

export function resolveSiteContent(raw: SiteContent): Omit<ResolvedSiteSettings, 'refresh'> {
  const phone = raw.phone?.trim() || academyInfo.phone
  const whatsapp = raw.whatsapp?.trim() || academyInfo.whatsapp
  const email = raw.email?.trim() || academyInfo.email || ''
  const address = raw.address?.trim() || academyInfo.address
  const district = raw.district?.trim() || academyInfo.district
  const instagram = raw.instagram?.trim() || academyInfo.instagram

  return {
    phone,
    whatsapp,
    email,
    address,
    district,
    instagram,

    hero_headline: raw.hero_headline?.trim() || 'Gücünü',
    hero_highlight: raw.hero_highlight?.trim() || 'Keşfet.',
    hero_subtext:
      raw.hero_subtext?.trim() ||
      "Bartın'da çocuklar ve gençler için profesyonel taekwondo eğitimi. Disiplin, özgüven ve birlik — haftada 3 gün.",
    hero_bg_url: raw.hero_bg_url?.trim() || undefined,

    hero_cta_primary_label: raw.hero_cta_primary_label?.trim() || 'Ücretsiz Deneme Dersi Al',
    hero_cta_primary_href: raw.hero_cta_primary_href?.trim() || '/iletisim',
    hero_cta_secondary_label: raw.hero_cta_secondary_label?.trim() || 'Dersleri İncele',
    hero_cta_secondary_href: raw.hero_cta_secondary_href?.trim() || '/dersler',
    home_hero_overline: raw.home_hero_overline?.trim() || 'Geleneksel Sanat, Modern Güç',

    google_maps_url: raw.google_maps_url?.trim() || academyInfo.google_maps_url,

    academy_stats: nonEmpty(raw.academy_stats, DEFAULT_ACADEMY_STATS),

    coach_name: raw.coach_name?.trim() || academyInfo.coach_name || 'Kerime Balaban',
    coach_title:
      raw.coach_title?.trim() ||
      academyInfo.coach_title ||
      'Baş Antrenör · 3. Dan Siyah Kuşak',
    coach_bio: raw.coach_bio?.trim() || academyInfo.coach_bio || '',
    coach_credentials: nonEmpty(raw.coach_credentials, DEFAULT_COACH_CREDENTIALS),

    about_hero_headline: raw.about_hero_headline?.trim() || 'Kim olduğumuzu',
    about_hero_highlight: raw.about_hero_highlight?.trim() || 'tanıyın.',
    about_hero_body:
      raw.about_hero_body?.trim() ||
      "Kerime Balaban Akademi, Bartın'ın kalbi Merkez ilçesinde çocuklar ve gençler için açılan profesyonel bir taekwondo akademisidir.",
    about_story_label: raw.about_story_label?.trim() || 'Hikayemiz',
    about_story_headline: raw.about_story_headline?.trim() || "Bartın'ın ilk",
    about_story_highlight: raw.about_story_highlight?.trim() || 'taekwondo akademisi.',
    about_story_paragraphs: nonEmpty(raw.about_story_paragraphs, DEFAULT_ABOUT_STORY_PARAGRAPHS),
    about_founded_year: raw.about_founded_year ?? academyInfo.founded_year ?? 2018,
    about_coach_label: raw.about_coach_label?.trim() || 'Antrenörümüz',
    about_values_label: raw.about_values_label?.trim() || 'Değerlerimiz',
    about_values_headline: raw.about_values_headline?.trim() || 'Temeller',
    about_values_highlight: raw.about_values_highlight?.trim() || 'sağlam.',
    about_values_body:
      raw.about_values_body?.trim() ||
      'Her antrenmanın arkasında dört temel değer yatar.',

    contact_hero_headline: raw.contact_hero_headline?.trim() || 'Hep buradayız.',
    contact_hero_body:
      raw.contact_hero_body?.trim() ||
      "Soru, kayıt ya da bilgi için bize her kanaldan ulaşabilirsiniz. En hızlı yanıt WhatsApp'tan gelir.",
    contact_hours_days: raw.contact_hours_days?.trim() || 'Pazartesi, Çarşamba, Cuma',
    contact_hours_time: raw.contact_hours_time?.trim() || '15:30 – 20:30',
    contact_form_label: raw.contact_form_label?.trim() || 'Mesaj Gönderin',
    contact_form_headline: raw.contact_form_headline?.trim() || 'Bize yazın.',
    contact_channels_label: raw.contact_channels_label?.trim() || 'Ulaşın',
    contact_channels_headline: raw.contact_channels_headline?.trim() || 'Direkt iletişim.',

    class_faqs: nonEmpty(raw.class_faqs, DEFAULT_CLASS_FAQS),

    home_cta_label: raw.home_cta_label?.trim() || 'Ücretsiz Deneme',
    home_cta_headline: raw.home_cta_headline?.trim() || 'İlk dersinizi',
    home_cta_headline_highlight: raw.home_cta_headline_highlight?.trim() || 'ücretsiz',
    home_cta_headline_suffix: raw.home_cta_headline_suffix?.trim() || 'deneyin.',
    home_cta_body:
      raw.home_cta_body?.trim() ||
      'Çocuğunuzu ya da kendinizi tanıştırmak için herhangi bir Pazartesi, Çarşamba veya Cuma sabahı ücretsiz deneme dersine bekliyoruz. Taahhüt yok, ekipman şartı yok.',
    home_cta_benefits: nonEmpty(raw.home_cta_benefits, DEFAULT_HOME_CTA_BENEFITS),
    home_cta_form_title: raw.home_cta_form_title?.trim() || 'Yer Ayırtın',
    home_cta_form_subtitle:
      raw.home_cta_form_subtitle?.trim() || "Bilgilerinizi bırakın, sizi WhatsApp'tan arayalım.",

    home_features_label: raw.home_features_label?.trim() || 'Neden KBA?',
    home_features_headline: raw.home_features_headline?.trim() || 'Fark yaratan',
    home_features_highlight: raw.home_features_highlight?.trim() || 'akademi.',
    home_features_body:
      raw.home_features_body?.trim() ||
      'Taekwondo sadece teknik değil; disiplin, özgüven ve takım ruhudur. Bunları doğru temelde inşa ediyoruz.',
    home_features_cards: nonEmpty(raw.home_features_cards, DEFAULT_HOME_FEATURES_CARDS),

    home_classes_label: raw.home_classes_label?.trim() || 'Ders Programı',
    home_classes_headline: raw.home_classes_headline?.trim() || 'Haftada 3 gün,',
    home_classes_highlight: raw.home_classes_highlight?.trim() || '4 farklı grup.',
    home_classes_body:
      raw.home_classes_body?.trim() ||
      'Yaş ve seviyeye göre ayrılmış gruplarla her öğrenci kendi temposunda gelişir. Pazartesi, Çarşamba ve Cuma antrenmanlar devam eder.',
    home_classes_link_label: raw.home_classes_link_label?.trim() || 'Tüm programı gör',

    home_announcements_label: raw.home_announcements_label?.trim() || 'Son Duyurular',
    home_announcements_headline: raw.home_announcements_headline?.trim() || 'Akademiden',
    home_announcements_highlight: raw.home_announcements_highlight?.trim() || 'haberler.',
    home_announcements_body:
      raw.home_announcements_body?.trim() ||
      'Kuşak sınavları, etkinlikler ve duyurular için burayı takip edin.',

    home_products_label: raw.home_products_label?.trim() || 'Ekipmanlar',
    home_products_headline: raw.home_products_headline?.trim() || 'İhtiyacınız olan',
    home_products_highlight: raw.home_products_highlight?.trim() || 'her şey.',
    home_products_body:
      raw.home_products_body?.trim() ||
      'Akademimizden temin edebileceğiniz taekwondo ekipmanları. Detaylar için WhatsApp üzerinden iletişime geçin.',

    about_values: nonEmpty(raw.about_values, DEFAULT_ABOUT_VALUES),
    about_cta_headline: raw.about_cta_headline?.trim() || 'Ailemize katılmaya hazır mısınız?',
    about_cta_body:
      raw.about_cta_body?.trim() || 'İlk ücretsiz ders için bugün iletişime geçin.',
    about_cta_primary_label: raw.about_cta_primary_label?.trim() || 'Bize Ulaşın',
    about_cta_secondary_label: raw.about_cta_secondary_label?.trim() || 'Dersleri İncele',

    classes_hero_label: raw.classes_hero_label?.trim() || 'Ders Programı',
    classes_hero_headline: raw.classes_hero_headline?.trim() || 'Seviyene uygun',
    classes_hero_highlight: raw.classes_hero_highlight?.trim() || 'grubunu bul.',
    classes_hero_body:
      raw.classes_hero_body?.trim() ||
      'Miniklerden ileri seviyeye kadar 4 farklı grup. Her çocuk kendi temposunda, güvenli ve eğlenceli bir ortamda gelişir.',
    classes_groups_label: raw.classes_groups_label?.trim() || 'Gruplarımız',
    classes_groups_headline: raw.classes_groups_headline?.trim() || '4 grup,',
    classes_groups_highlight: raw.classes_groups_highlight?.trim() || 'her yaşa uygun.',
    classes_schedule_label: raw.classes_schedule_label?.trim() || 'Günlük Program',
    classes_schedule_headline: raw.classes_schedule_headline?.trim() || 'Bir günde',
    classes_schedule_highlight: raw.classes_schedule_highlight?.trim() || 'neler oluyor?',
    classes_schedule_body:
      raw.classes_schedule_body?.trim() ||
      'Her antrenman günü aynı akış ile ilerler. Pazartesi, Çarşamba ve Cuma.',
    classes_faq_label: raw.classes_faq_label?.trim() || 'Sıkça Sorulan Sorular',
    classes_faq_headline: raw.classes_faq_headline?.trim() || 'Merak',
    classes_faq_highlight: raw.classes_faq_highlight?.trim() || 'ettikleriniz.',

    classes_schedule: nonEmpty(raw.classes_schedule, DEFAULT_CLASSES_SCHEDULE),
    classes_cta_headline: raw.classes_cta_headline?.trim() || 'Hangi grup sana uygun?',
    classes_cta_body:
      raw.classes_cta_body?.trim() || 'Bize ulaşın, birlikte doğru grubu bulalım.',
    classes_cta_button_label: raw.classes_cta_button_label?.trim() || 'İletişime Geç',

    announcements_hero_label: raw.announcements_hero_label?.trim() || 'Duyurular',
    announcements_hero_headline: raw.announcements_hero_headline?.trim() || 'Akademiden',
    announcements_hero_highlight: raw.announcements_hero_highlight?.trim() || 'son haberler.',
    announcements_hero_body:
      raw.announcements_hero_body?.trim() ||
      'Kuşak sınavları, etkinlikler, kapanış günleri ve akademi güncellemeleri burada yayınlanır.',

    products_hero_label: raw.products_hero_label?.trim() || 'Ekipmanlarımız',
    products_hero_headline: raw.products_hero_headline?.trim() || 'Doğru ekipman,',
    products_hero_highlight: raw.products_hero_highlight?.trim() || 'doğru başlangıç.',
    products_hero_body:
      raw.products_hero_body?.trim() ||
      'Taekwondo için ihtiyaç duyduğunuz tüm ekipmanları akademimizden temin edebilirsiniz. Sorularınız için bize WhatsApp üzerinden ulaşın.',
    products_cta_headline: raw.products_cta_headline?.trim() || 'Hangi ekipmanı seçmeli?',
    products_cta_body:
      raw.products_cta_body?.trim() ||
      "Deneyim seviyenize ve grubunuza göre tavsiye için WhatsApp'tan yazın.",
    products_cta_button_label: raw.products_cta_button_label?.trim() || "WhatsApp'tan Sor",

    whatsappLink: whatsappUrl(
      whatsapp,
      'Merhaba, Kerime Balaban Akademi hakkında bilgi almak istiyorum.',
    ),
    phoneLink: `tel:${phone.replace(/\s/g, '')}`,
    instagramLink: instagram ? `https://instagram.com/${instagram}` : undefined,
  }
}

const SiteSettingsContext = createContext<ResolvedSiteSettings | null>(null)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<SiteContent>(SITE_CONTENT_DEFAULTS)

  const load = async () => {
    const content = await getSiteContent()
    setRaw(content)
  }

  useEffect(() => {
    void load()
  }, [])

  const value: ResolvedSiteSettings = { ...resolveSiteContent(raw), refresh: load }

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  )
}

/**
 * Hook to get resolved site settings.
 * Falls back to pre-computed static values if used outside provider (e.g. in tests).
 */
export function useSiteSettings(): ResolvedSiteSettings {
  const ctx = useContext(SiteSettingsContext)
  if (ctx) return ctx
  return {
    ...resolveSiteContent(SITE_CONTENT_DEFAULTS),
    whatsappLink: staticContactLinks.whatsapp,
    phoneLink: staticContactLinks.phone,
    refresh: async () => undefined,
  }
}

import type { AcademyInfo, StatItem, HeroContent } from '@/types/content.types'
import { whatsappUrl } from '@/utils/format'

export const academyInfo: AcademyInfo = {
  name: 'Kerime Balaban Akademi',
  tagline: "Bartın'ın Taekwondo Akademisi",
  description:
    'Kerime Balaban Akademi, çocukların ve gençlerin beden ve ruh gelişimini desteklemek amacıyla Bartın Merkez\'de profesyonel taekwondo eğitimi sunmaktadır. Disiplin, özgüven ve takım ruhuyla büyüyen nesiller yetiştiriyoruz.',
  address: 'Bartın Merkez, Bartın',
  district: 'Bartın Merkez',
  city: 'Bartın',
  phone: '+90 XXX XXX XX XX',
  whatsapp: '+90XXXXXXXXXX',
  email: 'info@kerimebalabanakademi.com',
  instagram: 'kerimebalabanakademi',
  founded_year: 2018,
  coach_name: 'Kerime Balaban',
  coach_title: 'Baş Antrenör · 3. Dan Siyah Kuşak',
  coach_bio:
    'Kerime Balaban, ulusal düzeyde defalarca şampiyon olmuş, 10 yılı aşkın deneyime sahip bir taekwondo antrenörüdür. Öğrencilerin bireysel gelişimini ve takım ruhunu her zaman ön planda tutar.',
}

export const heroContent: HeroContent = {
  headline: 'Gücünü',
  headline_highlight: 'Keşfet.',
  subtext:
    "Bartın'da çocuklar ve gençler için profesyonel taekwondo eğitimi. Disiplin, özgüven ve birlik — haftada 3 gün.",
  cta_primary_label: 'Ücretsiz Deneme Dersi Al',
  cta_primary_href: '/iletisim',
  cta_secondary_label: 'Dersleri İncele',
  cta_secondary_href: '/dersler',
  background_image_url: undefined, // Will be set via admin later
}

export const academyStats: StatItem[] = [
  { value: '200+', label: 'Aktif Öğrenci' },
  { value: '7+', label: 'Yıllık Deneyim' },
  { value: '3', label: 'Antrenman Günü' },
  { value: '15+', label: 'Şampiyon Sporcu' },
]

export const contactLinks = {
  whatsapp: whatsappUrl(
    academyInfo.whatsapp,
    'Merhaba, Kerime Balaban Akademi hakkında bilgi almak istiyorum.'
  ),
  instagram: academyInfo.instagram
    ? `https://instagram.com/${academyInfo.instagram}`
    : undefined,
  phone: `tel:${academyInfo.phone.replace(/\s/g, '')}`,
}

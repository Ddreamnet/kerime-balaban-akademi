import type { ClassGroup } from '@/types/content.types'

/**
 * Static class schedule data.
 * Future: replace with `await supabase.from('classes').select('*').eq('is_active', true)`
 */
export const classGroups: ClassGroup[] = [
  {
    id: 'grup-minikler',
    name: 'Minikler Grubu',
    description:
      'Taekwondoya ilk adımı atan küçük sporcular için eğlenceli ve güvenli bir başlangıç programı. Koordinasyon, denge ve özgüven geliştirilir.',
    age_range: '5–7 yaş',
    belt_levels: ['beyaz', 'sari'],
    days: ['pazartesi', 'carsamba', 'cuma'],
    time_start: '15:30',
    time_end: '16:30',
    capacity: 15,
    instructor: 'Kerime Balaban',
    is_active: true,
    branch_id: '',
  },
  {
    id: 'grup-baslangic',
    name: 'Başlangıç Grubu',
    description:
      'Temel tekniklerin öğrenildiği, disiplin ve kuralların kazandırıldığı grup. Beyaz kuşaktan sarı kuşağa uzanan süreç.',
    age_range: '8–12 yaş',
    belt_levels: ['beyaz', 'sari'],
    days: ['pazartesi', 'carsamba', 'cuma'],
    time_start: '16:30',
    time_end: '17:30',
    capacity: 20,
    instructor: 'Kerime Balaban',
    is_active: true,
    branch_id: '',
  },
  {
    id: 'grup-orta',
    name: 'Orta Seviye Grubu',
    description:
      'Yeşil ve mavi kuşak sporcular için ileri teknikler, serbest dövüş ve müsabaka hazırlığına odaklanan program.',
    age_range: '10–15 yaş',
    belt_levels: ['yesil', 'mavi'],
    days: ['pazartesi', 'carsamba', 'cuma'],
    time_start: '17:30',
    time_end: '19:00',
    capacity: 18,
    instructor: 'Kerime Balaban',
    is_active: true,
    branch_id: '',
  },
  {
    id: 'grup-ileri',
    name: 'İleri Seviye Grubu',
    description:
      'Kırmızı ve siyah kuşak adayları için yoğun antrenman programı. Müsabaka takımı ve siyah kuşak sınavına hazırlık.',
    age_range: '13+ yaş',
    belt_levels: ['kirmizi', 'siyah'],
    days: ['pazartesi', 'carsamba', 'cuma'],
    time_start: '19:00',
    time_end: '20:30',
    capacity: 15,
    instructor: 'Kerime Balaban',
    is_active: true,
    branch_id: '',
  },
]

export const trainingDayLabels: Record<string, string> = {
  pazartesi: 'Pazartesi',
  sali: 'Salı',
  carsamba: 'Çarşamba',
  persembe: 'Perşembe',
  cuma: 'Cuma',
  cumartesi: 'Cumartesi',
  pazar: 'Pazar',
}

/** Daha kompakt, 3 harfli kısaltmalar — toolbar/chip'lerde kullanılabilir */
export const trainingDayShortLabels: Record<string, string> = {
  pazartesi: 'Pzt',
  sali: 'Sal',
  carsamba: 'Çrş',
  persembe: 'Prş',
  cuma: 'Cum',
  cumartesi: 'Cts',
  pazar: 'Paz',
}

export const beltLevelLabels: Record<string, string> = {
  beyaz: 'Beyaz',
  sari: 'Sarı',
  yesil: 'Yeşil',
  mavi: 'Mavi',
  kirmizi: 'Kırmızı',
  siyah: 'Siyah',
}

export const beltLevelColors: Record<string, string> = {
  beyaz: 'bg-white text-on-surface border border-outline/20',
  sari: 'bg-yellow-100 text-yellow-800',
  yesil: 'bg-green-100 text-green-800',
  mavi: 'bg-blue-100 text-blue-800',
  kirmizi: 'bg-red-100 text-red-800',
  siyah: 'bg-on-surface text-white',
}

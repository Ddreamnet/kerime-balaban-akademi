import type { Product } from '@/types/content.types'

/**
 * Static products data.
 * Future: replace with `await supabase.from('products').select('*').eq('is_available', true).order('sort_order')`
 */
export const products: Product[] = [
  {
    id: 'prod-dobok-cocuk',
    name: 'Çocuk Doboku',
    description:
      'ITF ve WTF standartlarına uygun, dayanıklı pamuk-polyester karışımı çocuk taekwondo kıyafeti. Hafif ve rahat kesim.',
    category: 'dobok',
    image_url: undefined,
    price: undefined,
    is_inquiry_only: true,
    is_featured: true,
    is_available: true,
    sort_order: 1,
  },
  {
    id: 'prod-dobok-yetiskin',
    name: 'Yetişkin Doboku',
    description:
      'Profesyonel antrenman ve müsabakalar için yüksek kalite doboku. Nefes alabilen kumaş, güçlendirilmiş dikiş.',
    category: 'dobok',
    image_url: undefined,
    price: undefined,
    is_inquiry_only: true,
    is_featured: true,
    is_available: true,
    sort_order: 2,
  },
  {
    id: 'prod-kask',
    name: 'Kask & Kafa Koruyucu',
    description:
      'WTF onaylı, tam kafa koruma sağlayan serbest dövüş kasket. Yüz kafesi dahil, çocuk ve yetişkin bedenleri mevcut.',
    category: 'koruyucu',
    image_url: undefined,
    price: undefined,
    is_inquiry_only: true,
    is_featured: true,
    is_available: true,
    sort_order: 3,
  },
  {
    id: 'prod-el-koruyucu',
    name: 'El & Ayak Koruyucu Set',
    description:
      'Antrenman ve müsabaka için tam set el ve ayak koruyucu. Sünger destekli, velcro bağlantı, tüm bedenler.',
    category: 'koruyucu',
    image_url: undefined,
    price: undefined,
    is_inquiry_only: true,
    is_featured: false,
    is_available: true,
    sort_order: 4,
  },
  {
    id: 'prod-govde-koruyucu',
    name: 'Gövde Koruyucu (Hogu)',
    description:
      'WTF onaylı elektronik ya da geleneksel hogu. Müsabaka oyuncuları için standart koruma ekipmanı.',
    category: 'koruyucu',
    image_url: undefined,
    price: undefined,
    is_inquiry_only: true,
    is_featured: false,
    is_available: true,
    sort_order: 5,
  },
  {
    id: 'prod-kemer',
    name: 'Renkli Kuşak Seti',
    description:
      'Sertifikalı derece kuşakları. Sinav geçişlerinde akademimizden temin edilebilir.',
    category: 'aksesuar',
    image_url: undefined,
    price: undefined,
    is_inquiry_only: true,
    is_featured: false,
    is_available: true,
    sort_order: 6,
  },
]

export const productCategoryLabels: Record<string, string> = {
  dobok: 'Doboku',
  koruyucu: 'Koruyucu Ekipman',
  aksesuar: 'Aksesuar',
  diger: 'Diğer',
}

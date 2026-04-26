import type { Announcement } from '@/types/content.types'

/**
 * Static announcements data.
 * Future: replace with `await supabase.from('announcements').select('*').eq('is_published', true).order('published_at', { ascending: false })`
 */
export const announcements: Announcement[] = [
  {
    id: 'ann-sinav-2024',
    title: 'Kuşak Sınavı — Nisan 2024',
    excerpt:
      'Nisan ayı kuşak terfi sınavımız 20 Nisan Cumartesi günü saat 10:00\'da gerçekleşecektir. Tüm sporculara başarılar!',
    content:
      'Değerli öğrencilerimiz ve velilerimiz,\n\nNisan 2024 kuşak terfi sınavımız 20 Nisan Cumartesi günü saat 10:00\'da akademimizde gerçekleştirilecektir.\n\nSınava katılacak öğrencilerin larını giymiş olarak en geç saat 09:30\'da hazır olmaları beklenmektedir. Velilerin de törene katılımı memnuniyetle karşılanır.\n\nTüm sporcularımıza başarılar dileriz.',
    category: 'sinav',
    image_url: undefined,
    published_at: '2024-04-01T10:00:00.000Z',
    is_pinned: true,
    is_published: true,
  },
  {
    id: 'ann-yaz-donemi',
    title: 'Yaz Dönemi Kayıtları Başlıyor',
    excerpt:
      'Haziran-Ağustos yaz dönemi kayıtları 15 Mayıs\'ta başlıyor. Kontenjanlar sınırlı, erken kayıt fırsatını kaçırmayın.',
    content:
      'Yaz dönemimiz için kayıt sürecimiz 15 Mayıs itibarıyla başlayacaktır. Bu dönem de Pazartesi, Çarşamba ve Cuma günleri antrenmanlarımız devam edecektir.\n\nErken kayıt için WhatsApp veya telefon aracılığıyla bizimle iletişime geçebilirsiniz. Kontenjanlarımız sınırlıdır.',
    category: 'duyuru',
    image_url: undefined,
    published_at: '2024-04-10T09:00:00.000Z',
    is_pinned: false,
    is_published: true,
  },
  {
    id: 'ann-turnuva',
    title: 'Bartın İl Şampiyonası Sonuçları',
    excerpt:
      'Sporcularımız Bartın İl Taekwondo Şampiyonası\'ndan 4 altın, 3 gümüş madalyayla döndü. Hepsini tebrik ederiz!',
    content:
      'Geçtiğimiz hafta sonu düzenlenen Bartın İl Taekwondo Şampiyonası\'nda sporcularımız büyük bir başarıya imza attı.\n\nToplam 7 madalya kazanan takımımıza ve ailelerine teşekkür ederiz. Bu başarı, haftalar süren özverili çalışmanın meyvesidir.',
    category: 'etkinlik',
    image_url: undefined,
    published_at: '2024-03-25T14:00:00.000Z',
    is_pinned: false,
    is_published: true,
  },
]

export const announcementCategoryLabels: Record<string, string> = {
  genel: 'Genel',
  sinav: 'Sınav',
  etkinlik: 'Etkinlik',
  duyuru: 'Duyuru',
  tatil: 'Tatil',
}

export const announcementCategoryColors: Record<string, string> = {
  genel: 'bg-surface-low text-on-surface',
  sinav: 'bg-secondary-container text-secondary',
  etkinlik: 'bg-primary-container text-primary',
  duyuru: 'bg-surface-low text-on-surface',
  tatil: 'bg-yellow-100 text-yellow-800',
}

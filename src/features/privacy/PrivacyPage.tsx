import { useNavigate } from 'react-router-dom'
import { ChevronRight, Mail, MessageCircle } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SEO } from '@/components/SEO'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { academyInfo } from '@/data/academyInfo'

const LAST_UPDATED = '25 Nisan 2026'

const TOC = [
  { id: 'veri-sorumlusu', label: '1. Veri Sorumlusu' },
  { id: 'toplanan-veriler', label: '2. Toplanan Kişisel Veriler' },
  { id: 'kullanim-amaci', label: '3. Verilerin İşlenme Amaçları' },
  { id: 'ucuncu-taraflar', label: '4. Üçüncü Taraf Hizmet Sağlayıcılar' },
  { id: 'mobil-izinler', label: '5. Mobil Uygulama İzinleri' },
  { id: 'bildirimler', label: '6. Bildirimler' },
  { id: 'cocuk-gizliligi', label: '7. Çocukların Gizliliği' },
  { id: 'saklama-suresi', label: '8. Saklama Süresi' },
  { id: 'guvenlik', label: '9. Veri Güvenliği' },
  { id: 'haklariniz', label: '10. KVKK Kapsamındaki Haklarınız' },
  { id: 'cerezler', label: '11. Çerezler ve Yerel Depolama' },
  { id: 'degisiklikler', label: '12. Politika Değişiklikleri' },
  { id: 'iletisim', label: '13. İletişim' },
]

export function PrivacyPage() {
  const settings = useSiteSettings()
  const navigate = useNavigate()

  return (
    <>
      <SEO
        title="Gizlilik Politikası — Kerime Balaban Taekwondo Akademisi"
        description="Kerime Balaban Akademi web sitesi ve mobil uygulamasının gizlilik politikası. KVKK kapsamında topladığımız veriler, işleme amaçları ve haklarınız."
        path="/gizlilik"
      />

      <PageHero
        label="Yasal"
        headline="Gizlilik"
        highlight="Politikası"
        body="Kerime Balaban Akademi olarak kişisel verilerinize saygı duyuyoruz. Bu politika, web sitemizi ve mobil uygulamamızı kullandığınızda hangi verilerin toplandığını, nasıl kullanıldığını ve haklarınızı açıklar."
      />

      <Section bg="default">
        <Container narrow>
          <div className="flex flex-col gap-12">

            {/* Last updated */}
            <p className="text-body-sm text-on-surface/55">
              Son güncelleme: <span className="font-semibold text-on-surface/80">{LAST_UPDATED}</span>
            </p>

            {/* Table of contents */}
            <Card padding="lg" className="flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-sm text-on-surface">
                İçindekiler
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {TOC.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-center gap-2 text-body-sm text-on-surface/70 hover:text-primary transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>

            {/* 1. Veri Sorumlusu */}
            <article id="veri-sorumlusu" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                1. Veri Sorumlusu
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;)
                kapsamında veri sorumlusu sıfatıyla hareket eden{' '}
                <span className="font-semibold text-on-surface">
                  Kerime Balaban Taekwondo Akademisi
                </span>
                , bu politika uyarınca kişisel verilerinizin işlenmesi
                süreçlerinden sorumludur.
              </p>
              <ul className="flex flex-col gap-2 text-body-md text-on-surface/70">
                <li>
                  <span className="font-semibold text-on-surface">Adres: </span>
                  {settings.address}
                </li>
                <li>
                  <span className="font-semibold text-on-surface">E-posta: </span>
                  <a
                    href={`mailto:${academyInfo.email}`}
                    className="text-primary hover:underline"
                  >
                    {academyInfo.email}
                  </a>
                </li>
                <li>
                  <span className="font-semibold text-on-surface">Telefon: </span>
                  {settings.phone}
                </li>
              </ul>
            </article>

            {/* 2. Toplanan Kişisel Veriler */}
            <article id="toplanan-veriler" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                2. Toplanan Kişisel Veriler
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Akademiye kayıt, ders takibi ve iletişim süreçlerinin yürütülebilmesi
                için aşağıdaki kişisel veri kategorilerini topluyoruz:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Kimlik ve İletişim
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    Ad, soyad, e-posta adresi, cep telefonu numarası, profil
                    fotoğrafı.
                  </p>
                </Card>
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Hesap Verileri
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    Kullanıcı rolü (veli, antrenör, yönetici), onay durumu,
                    şifrelenmiş kimlik doğrulama bilgileri.
                  </p>
                </Card>
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Çocuk / Sporcu Bilgileri
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    Veli hesabına bağlı sporcunun adı, doğum tarihi, kuşak
                    seviyesi, atanmış antrenör ve grup bilgisi.
                  </p>
                </Card>
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Eğitim ve Devam Verileri
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    Yoklama kayıtları, sınav sonuçları, performans notları,
                    ödeme durumu.
                  </p>
                </Card>
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Cihaz Verileri
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    Bildirim göndermek için cihaz kayıt belirteci (FCM/APNs token),
                    işletim sistemi ve uygulama sürümü.
                  </p>
                </Card>
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Görsel ve Belge
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    Profil için seçtiğiniz fotoğraf ve gerektiğinde yüklediğiniz
                    sporcu belgeleri.
                  </p>
                </Card>
              </div>

              <p className="text-body-sm text-on-surface/55 leading-relaxed">
                Sosyal güvenlik numarası, banka kartı bilgileri veya konum verisi{' '}
                <span className="font-semibold">toplanmaz</span>. Konum izni
                istenmez; ödemeler uygulama içinden alınmaz.
              </p>
            </article>

            {/* 3. Kullanım Amaçları */}
            <article id="kullanim-amaci" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                3. Verilerin İşlenme Amaçları
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Kişisel verileriniz aşağıdaki meşru amaçlarla, KVKK Madde 5
                uyarınca işlenir:
              </p>
              <ul className="flex flex-col gap-2.5 text-body-md text-on-surface/70">
                {[
                  'Akademiye kayıt, üyelik ve onay süreçlerinin yürütülmesi',
                  'Antrenmanların planlanması, yoklama ve sınav takibinin yapılması',
                  'Veliler ile antrenörler arasında iletişim kurulması',
                  'Duyuruların ve önemli güncellemelerin iletilmesi',
                  'Yasal yükümlülüklerin yerine getirilmesi',
                  'Hizmet kalitesinin değerlendirilmesi ve iyileştirilmesi',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* 4. Üçüncü Taraflar */}
            <article id="ucuncu-taraflar" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                4. Üçüncü Taraf Hizmet Sağlayıcılar
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Hizmetimizi sunabilmek için aşağıdaki güvenilir altyapı
                sağlayıcılarıyla çalışıyoruz. Verileriniz yalnızca hizmetin
                gerektirdiği ölçüde paylaşılır:
              </p>

              <div className="flex flex-col gap-3">
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Supabase
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    Veritabanı, kimlik doğrulama ve dosya depolama altyapısı.
                    Verileriniz bu altyapıda şifreli olarak saklanır.
                  </p>
                </Card>
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Google Firebase Cloud Messaging (FCM)
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    Android cihazlara anlık bildirim göndermek için kullanılır.
                    Sadece cihaz belirteci paylaşılır; bildirim içeriği şifrelidir.
                  </p>
                </Card>
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Apple Push Notification Service (APNs)
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    iOS cihazlara anlık bildirim iletilmesini sağlar. Cihaz
                    belirteci dışında kişisel veri aktarılmaz.
                  </p>
                </Card>
                <Card padding="md" className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-title-md text-on-surface">
                    Apple App Store / Google Play
                  </h3>
                  <p className="text-body-sm text-on-surface/65 leading-relaxed">
                    Uygulama dağıtımı ve güncellemeler için kullanılır. İlgili
                    mağazaların kendi gizlilik politikaları geçerlidir.
                  </p>
                </Card>
              </div>

              <p className="text-body-sm text-on-surface/55 leading-relaxed">
                Verileriniz <span className="font-semibold">satılmaz</span>,{' '}
                <span className="font-semibold">reklam amaçlı kullanılmaz</span> ve
                yukarıda sayılanlar dışında üçüncü taraflarla paylaşılmaz.
              </p>
            </article>

            {/* 5. Mobil İzinler */}
            <article id="mobil-izinler" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                5. Mobil Uygulama İzinleri
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Mobil uygulamamız, yalnızca aşağıdaki durumlar için sistem
                izni ister. Tüm izinler isteğe bağlıdır ve cihaz ayarlarınızdan
                istediğiniz zaman geri çekilebilir.
              </p>
              <ul className="flex flex-col gap-3 text-body-md text-on-surface/70">
                <li className="flex items-start gap-3">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>
                    <span className="font-semibold text-on-surface">Kamera: </span>
                    Profil fotoğrafı çekmek istediğinizde sorulur.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>
                    <span className="font-semibold text-on-surface">Fotoğraflar: </span>
                    Galeriden bir fotoğraf seçmek istediğinizde sorulur. Galerinizdeki
                    diğer fotoğraflara erişilmez.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>
                    <span className="font-semibold text-on-surface">Bildirimler: </span>
                    Duyuru, yoklama ve antrenman uyarılarını alabilmeniz için
                    istenir.
                  </span>
                </li>
              </ul>
            </article>

            {/* 6. Bildirimler */}
            <article id="bildirimler" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                6. Bildirimler
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                İzin verdiğiniz takdirde antrenman duyuruları, yoklama bilgileri
                ve önemli akademi haberlerini cihazınıza ileterek size
                ulaşırız. Bildirimleri istediğiniz zaman cihaz ayarlarınızdan
                kapatabilirsiniz; bu durum uygulamanın diğer özelliklerini
                etkilemez.
              </p>
            </article>

            {/* 7. Çocukların Gizliliği */}
            <article id="cocuk-gizliligi" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                7. Çocukların Gizliliği
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Akademimiz çocuklara ve gençlere yönelik eğitim verdiğinden, sporcu
                bilgilerini yalnızca <span className="font-semibold">veli onayı ile </span>
                ve veli hesabı üzerinden topluyoruz. 18 yaşın altındaki
                kullanıcılar uygulamada kendi adlarına hesap açamaz.
              </p>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Çocuğunuza ait verilerin silinmesini istediğinizde aşağıdaki
                iletişim kanallarından bize başvurabilirsiniz. Talebiniz en geç{' '}
                <span className="font-semibold">30 gün</span> içinde sonuçlandırılır.
              </p>
            </article>

            {/* 8. Saklama Süresi */}
            <article id="saklama-suresi" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                8. Saklama Süresi
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Kişisel verileriniz; üyeliğiniz aktif olduğu sürece ve
                üyeliğin sona ermesinin ardından yasal yükümlülüklerimiz
                kapsamında saklanır. Yasal saklama yükümlülüğü kalmadığında
                veriler silinir, yok edilir veya anonim hâle getirilir.
              </p>
            </article>

            {/* 9. Güvenlik */}
            <article id="guvenlik" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                9. Veri Güvenliği
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Verilerinizin güvenliği için endüstri standardı tedbirler
                uyguluyoruz: tüm bağlantılar TLS ile şifrelenir, şifreler
                tek yönlü olarak saklanır, veritabanı erişimi rol bazlı satır
                seviyesi güvenliği (RLS) ile kısıtlanır ve yetkisiz girişlere
                karşı düzenli kontroller yapılır.
              </p>
            </article>

            {/* 10. KVKK Hakları */}
            <article id="haklariniz" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                10. KVKK Kapsamındaki Haklarınız
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                KVKK Madde 11 uyarınca, kişisel verileriniz hakkında aşağıdaki
                haklara sahipsiniz:
              </p>
              <ul className="flex flex-col gap-2.5 text-body-md text-on-surface/70">
                {[
                  'Verilerinizin işlenip işlenmediğini öğrenme',
                  'İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
                  'Yurt içinde veya yurt dışında aktarıldığı tarafları bilme',
                  'Eksik veya yanlış işlenen verilerin düzeltilmesini isteme',
                  'Yasal şartlar oluştuğunda silinmesini veya yok edilmesini isteme',
                  'İşlemenin sonucunda aleyhe çıkan sonuçlara itiraz etme',
                  'Zarara uğramanız hâlinde tazminat talep etme',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-body-sm text-on-surface/55 leading-relaxed">
                Hesabınızı ve ilişkili tüm verilerinizi silmek için{' '}
                <a
                  href={`mailto:${academyInfo.email}?subject=Hesap%20Silme%20Talebi`}
                  className="text-primary hover:underline font-semibold"
                >
                  {academyInfo.email}
                </a>{' '}
                adresine e-posta gönderebilirsiniz.
              </p>
            </article>

            {/* 11. Çerezler */}
            <article id="cerezler" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                11. Çerezler ve Yerel Depolama
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Web sitemiz ve uygulamamız, oturum açık kalmasını sağlamak ve
                tercihlerinizi hatırlamak için tarayıcınızın yerel depolaması
                (<em>localStorage</em>) ile çerezlerden faydalanır. Reklam veya
                izleme amaçlı üçüncü taraf çerezleri kullanılmaz.
              </p>
            </article>

            {/* 12. Değişiklikler */}
            <article id="degisiklikler" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                12. Politika Değişiklikleri
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Bu politika, hizmetlerimizdeki ve mevzuattaki değişikliklere
                bağlı olarak güncellenebilir. Güncellemeler bu sayfada
                yayımlanır ve yukarıdaki &ldquo;Son güncelleme&rdquo; tarihi
                değiştirilir. Önemli değişikliklerde uygulama içi bildirimle
                veya e-posta yoluyla ayrıca bilgilendirme yaparız.
              </p>
            </article>

            {/* 13. İletişim */}
            <article id="iletisim" className="scroll-mt-24 flex flex-col gap-4">
              <h2 className="font-display font-bold text-headline-lg text-on-surface">
                13. İletişim
              </h2>
              <p className="text-body-md text-on-surface/70 leading-relaxed">
                Gizlilik politikamızla, verilerinizin işlenmesiyle veya KVKK
                kapsamındaki haklarınızla ilgili her türlü soru ve talep için
                bize ulaşabilirsiniz:
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    window.location.href = `mailto:${academyInfo.email}`
                  }}
                >
                  <Mail className="w-4 h-4" />
                  E-posta Gönder
                </Button>
                {settings.whatsappLink && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      window.open(settings.whatsappLink, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                )}
                <Button variant="ghost" size="md" onClick={() => navigate('/iletisim')}>
                  İletişim Sayfası
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </article>

          </div>
        </Container>
      </Section>
    </>
  )
}

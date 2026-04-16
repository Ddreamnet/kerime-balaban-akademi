import { useNavigate } from 'react-router-dom'
import { Clock, Info, ChevronRight } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/Button'
import { ClassGroupCard } from './ClassGroupCard'
import { classGroups, trainingDayLabels } from '@/data/classes'
import { cn } from '@/utils/cn'

const trainingDays = [
  { key: 'pazartesi', abbr: 'Pzt' },
  { key: 'carsamba', abbr: 'Çar' },
  { key: 'cuma', abbr: 'Cum' },
]

const faqs = [
  {
    q: 'Başlamak için hangi ekipman gereklidir?',
    a: 'İlk derse spor kıyafetiyle gelebilirsiniz. Kayıt sonrası doboku ve temel koruyucu ekipman hakkında bilgi verilir.',
  },
  {
    q: 'Kaç yaşından itibaren başlayabilir?',
    a: "Minikler grubumuz 5 yaşından itibaren çocukları kabul etmektedir. Üst gruplar için minimum yaş koşulları ilgili grup kartında belirtilmiştir.",
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

export function ClassesPage() {
  const navigate = useNavigate()

  return (
    <>
      <PageHero
        label="Ders Programı"
        headline="Seviyene uygun"
        highlight="grubunu bul."
        body="Miniklerden ileri seviyeye kadar 4 farklı grup. Her çocuk kendi temposunda, güvenli ve eğlenceli bir ortamda gelişir."
      />

      {/* Schedule days strip */}
      <div className="bg-secondary py-5">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-display font-semibold text-white text-title-md">
              Antrenman Günleri
            </p>
            <div className="flex gap-3">
              {trainingDays.map(({ key, abbr }) => (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-white/15 rounded-lg px-4 py-2"
                >
                  <span className="w-2 h-2 rounded-full bg-secondary-light shrink-0" />
                  <span className="font-display font-semibold text-white text-sm">
                    <span className="sm:hidden">{abbr}</span>
                    <span className="hidden sm:inline">{trainingDayLabels[key]}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Belt level legend */}
      <Section bg="card" noPad className="py-6 border-b border-surface-low">
        <Container>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-label-md text-on-surface/40 uppercase tracking-widest">
              Seviye Göstergesi
            </span>
            {[
              { label: 'Başlangıç (Beyaz–Sarı)', color: 'border-l-yellow-400 bg-yellow-50' },
              { label: 'Orta Seviye (Yeşil–Mavi)', color: 'border-l-blue-500 bg-blue-50' },
              { label: 'İleri Seviye (Kırmızı–Siyah)', color: 'border-l-primary bg-red-50' },
            ].map(({ label, color }) => (
              <div
                key={label}
                className={cn('flex items-center gap-2 border-l-4 pl-2 rounded-r-sm py-0.5', color)}
              >
                <span className="text-body-sm text-on-surface/70">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Class groups */}
      <Section bg="default">
        <Container>
          <div className="flex flex-col gap-10">
            <SectionHeader
              label="Gruplarımız"
              headline="4 grup,"
              highlight="her yaşa uygun."
            />

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {classGroups.map((group) => (
                <ClassGroupCard key={group.id} group={group} variant="default" />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Daily schedule timeline */}
      <Section bg="card">
        <Container>
          <div className="flex flex-col gap-8">
            <SectionHeader
              label="Günlük Program"
              headline="Bir günde"
              highlight="neler oluyor?"
              body="Her antrenman günü aynı akış ile ilerler. Pazartesi, Çarşamba ve Cuma."
            />

            <div className="max-w-xl">
              {[
                { time: '15:30 – 16:30', group: 'Minikler Grubu', note: '5–7 yaş' },
                { time: '16:30 – 17:30', group: 'Başlangıç Grubu', note: '8–12 yaş' },
                { time: '17:30 – 19:00', group: 'Orta Seviye Grubu', note: '10–15 yaş' },
                { time: '19:00 – 20:30', group: 'İleri Seviye Grubu', note: '13+ yaş' },
              ].map((slot, i) => (
                <div key={i} className="flex gap-4 group">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1 shrink-0" />
                    {i < 3 && <div className="w-px flex-1 bg-surface-low my-1" />}
                  </div>
                  {/* Content */}
                  <div className="flex flex-col gap-0.5 pb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary/60" />
                      <span className="font-display font-semibold text-title-md text-on-surface">
                        {slot.time}
                      </span>
                    </div>
                    <span className="text-body-md text-on-surface/80">{slot.group}</span>
                    <span className="text-body-sm text-on-surface/45">{slot.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section bg="default">
        <Container narrow>
          <div className="flex flex-col gap-8">
            <SectionHeader
              label="Sıkça Sorulan Sorular"
              headline="Merak"
              highlight="ettikleriniz."
              align="center"
            />

            <div className="flex flex-col gap-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-surface-card rounded-lg p-5 shadow-ambient"
                >
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-2">
                      <h3 className="font-display font-semibold text-title-md text-on-surface">
                        {faq.q}
                      </h3>
                      <p className="text-body-md text-on-surface/60 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Bottom CTA */}
      <Section bg="primary">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="font-display font-bold text-headline-lg text-white">
                Hangi grup sana uygun?
              </h2>
              <p className="text-body-lg text-white/70 mt-1">
                Bize ulaşın, birlikte doğru grubu bulalım.
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/iletisim')}
              className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 shrink-0"
            >
              İletişime Geç
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}

import { Shield, Award, Users, Target } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'

const pillars = [
  {
    icon: Shield,
    title: 'Güvenli Ortam',
    body: 'Çocukların fiziksel ve duygusal güvenliği her şeyden önce gelir. Denetimli antrenmanlar, uygun ekipman ve seviyeye göre gruplar.',
    accent: 'bg-primary-container',
    iconColor: 'text-primary',
  },
  {
    icon: Award,
    title: 'Uzman Antrenör',
    body: "Kerime Balaban, ulusal düzeyde şampiyon olmuş 3. Dan siyah kuşak sahibidir. 10+ yıllık öğretim deneyimi.",
    accent: 'bg-secondary-container',
    iconColor: 'text-secondary',
  },
  {
    icon: Users,
    title: 'Küçük Gruplar',
    body: 'Maksimum 20 öğrencili gruplar her çocuğa bireysel ilgi ve gelişim takibi imkânı sağlar.',
    accent: 'bg-green-100',
    iconColor: 'text-green-700',
  },
  {
    icon: Target,
    title: 'Hedef Odaklı',
    body: 'Kuşak sınavları, müsabaka katılımı ve bireysel performans takibi ile her öğrencinin hedefi netleşir.',
    accent: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
  },
]

export function ValuePropSection() {
  return (
    <Section bg="card">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Header — left column on desktop */}
          <SectionHeader
            label="Neden KBA?"
            headline="Fark yaratan"
            highlight="akademi."
            body="Taekwondo sadece teknik değil; disiplin, özgüven ve takım ruhudur. Bunları doğru temelde inşa ediyoruz."
            className="lg:sticky lg:top-28"
          />

          {/* Pillars grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="flex flex-col gap-4 bg-surface rounded-xl p-6 shadow-ambient"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${p.accent} flex items-center justify-center`}
                >
                  <p.icon className={`w-5 h-5 ${p.iconColor}`} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-title-lg text-on-surface">
                    {p.title}
                  </h3>
                  <p className="text-body-sm text-on-surface/60 leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </Section>
  )
}

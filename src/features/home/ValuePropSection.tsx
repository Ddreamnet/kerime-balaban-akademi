import { Shield, Award, Users, Target } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const ICON_PALETTE = [
  { Icon: Shield, accent: 'bg-primary-container', iconColor: 'text-primary' },
  { Icon: Award, accent: 'bg-secondary-container', iconColor: 'text-secondary' },
  { Icon: Users, accent: 'bg-green-100', iconColor: 'text-green-700' },
  { Icon: Target, accent: 'bg-yellow-100', iconColor: 'text-yellow-700' },
]

export function ValuePropSection() {
  const settings = useSiteSettings()

  return (
    <Section bg="card">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Header — left column on desktop */}
          <SectionHeader
            label={settings.home_features_label}
            headline={settings.home_features_headline}
            highlight={settings.home_features_highlight}
            body={settings.home_features_body}
            className="lg:sticky lg:top-28"
          />

          {/* Pillars grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {settings.home_features_cards.map((card, i) => {
              const style = ICON_PALETTE[i % ICON_PALETTE.length]
              const Icon = style.Icon
              return (
                <div
                  key={`${card.title}-${i}`}
                  className="flex flex-col gap-4 bg-surface rounded-xl p-6 shadow-ambient"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${style.accent} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-title-lg text-on-surface">
                      {card.title}
                    </h3>
                    <p className="text-body-sm text-on-surface/60 leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </Container>
    </Section>
  )
}

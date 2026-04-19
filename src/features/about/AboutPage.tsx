import { useNavigate } from 'react-router-dom'
import { Award, Heart, Target, Flame, ChevronRight, type LucideIcon } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useSiteSettings } from '@/hooks/useSiteSettings'

// Icons assigned by position. If admin adds more than 4, extras cycle through the same set.
const VALUE_ICONS: LucideIcon[] = [Award, Heart, Target, Flame]

export function AboutPage() {
  const navigate = useNavigate()
  const settings = useSiteSettings()

  return (
    <>
      <PageHero
        label="Hakkımızda"
        headline={settings.about_hero_headline}
        highlight={settings.about_hero_highlight}
        body={settings.about_hero_body}
      />

      {/* Academy story */}
      <Section bg="card">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* Text */}
            <div className="flex flex-col gap-6">
              <SectionHeader
                label={settings.about_story_label}
                headline={settings.about_story_headline}
                highlight={settings.about_story_highlight}
              />
              <div className="flex flex-col gap-4 text-body-lg text-on-surface/65 leading-relaxed">
                {settings.about_story_paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {settings.academy_stats.map((stat, i) => (
                <Card key={i} className="flex flex-col gap-1 text-center py-6">
                  <span className="font-display font-black text-primary text-4xl leading-none">
                    {stat.value}
                  </span>
                  <span className="text-body-sm text-on-surface/60 leading-tight">
                    {stat.label}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Coach */}
      <Section bg="default">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">

            {/* Coach image placeholder */}
            <div className="flex flex-col items-center gap-4 order-2 lg:order-1">
              <div className="w-full max-w-xs aspect-[3/4] rounded-2xl bg-surface-card shadow-ambient-md flex flex-col items-center justify-center gap-3">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-primary-glow/20">
                  <span className="font-display font-black text-white text-2xl">KB</span>
                </div>
                <p className="text-body-sm text-on-surface/40 italic">Fotoğraf yakında</p>
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-on-surface text-title-lg">
                  {settings.coach_name}
                </p>
                <p className="text-body-sm text-primary font-semibold mt-0.5">
                  {settings.coach_title}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-6 order-1 lg:order-2">
              <SectionHeader
                label={settings.about_coach_label}
                headline={settings.coach_name}
              />

              <p className="text-body-lg text-on-surface/65 leading-relaxed">
                {settings.coach_bio}
              </p>

              <div className="flex flex-col gap-3">
                {settings.coach_credentials.map((credential) => (
                  <div key={credential} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-body-md text-on-surface/70">{credential}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section bg="low">
        <Container>
          <div className="flex flex-col gap-10">
            <SectionHeader
              label={settings.about_values_label}
              headline={settings.about_values_headline}
              highlight={settings.about_values_highlight}
              align="center"
              body={settings.about_values_body}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {settings.about_values.map((v, i) => {
                const Icon = VALUE_ICONS[i % VALUE_ICONS.length]
                return (
                  <Card key={`${v.title}-${i}`} className="flex flex-col gap-4 text-center items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-display font-bold text-title-md text-on-surface">
                        {v.title}
                      </h3>
                      <p className="text-body-sm text-on-surface/60 leading-relaxed">{v.body}</p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section bg="primary">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="font-display font-bold text-headline-lg text-white">
                {settings.about_cta_headline}
              </h2>
              <p className="text-body-lg text-white/70 mt-1">
                {settings.about_cta_body}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/iletisim')}
                className="border-white/40 text-white hover:bg-white/10 shrink-0"
              >
                {settings.about_cta_primary_label}
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/dersler')}
                className="text-white/70 hover:text-white hover:bg-white/10 shrink-0"
              >
                {settings.about_cta_secondary_label}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { ClassGroupCard } from '@/features/classes/ClassGroupCard'
import { classGroups } from '@/data/classes'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export function ClassPreviewSection() {
  const settings = useSiteSettings()
  return (
    <Section bg="default">
      <Container>
        <div className="flex flex-col gap-10">

          {/* Header row */}
          <SectionHeader
            label={settings.home_classes_label}
            headline={settings.home_classes_headline}
            highlight={settings.home_classes_highlight}
            body={settings.home_classes_body}
            action={
              <Link
                to="/dersler"
                className="hidden md:flex items-center gap-1 text-body-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                {settings.home_classes_link_label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          {/* Schedule days banner */}
          <div className="flex items-center gap-3 bg-on-surface rounded-xl px-5 py-4">
            <span className="text-label-md text-white/40 uppercase tracking-widest hidden sm:block shrink-0">
              Antrenman Günleri
            </span>
            <div className="flex-1 h-px bg-white/10 hidden sm:block" />
            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start">
              {[
                { day: 'Pazartesi', short: 'PAZ' },
                { day: 'Çarşamba', short: 'ÇAR' },
                { day: 'Cuma', short: 'CUM' },
              ].map(({ day, short }) => (
                <div key={day} className="flex-1 sm:flex-none flex flex-col sm:flex-row items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                  <span className="font-display font-semibold text-white text-sm">
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{day}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {classGroups.map((group) => (
              <ClassGroupCard key={group.id} group={group} variant="compact" />
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="flex justify-center md:hidden">
            <Link
              to="/dersler"
              className="flex items-center gap-2 text-body-md font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              {settings.home_classes_link_label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </Container>
    </Section>
  )
}

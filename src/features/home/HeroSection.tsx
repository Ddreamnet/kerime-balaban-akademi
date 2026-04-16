import { useNavigate } from 'react-router-dom'
import { ChevronRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { heroContent, academyStats, academyInfo } from '@/data/academyInfo'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export function HeroSection() {
  const navigate = useNavigate()
  const settings = useSiteSettings()

  return (
    <section className="relative bg-on-surface overflow-hidden min-h-[92dvh] flex items-center">
      {/* ── Decorative accent layers — "weaving belt" motif ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Deep red band — bleeds off the right */}
        <div className="absolute -right-20 top-0 h-full w-2/5 bg-gradient-primary opacity-[0.07] -skew-x-6" />
        <div className="absolute -right-6 top-0 h-full w-1/4 bg-gradient-primary opacity-[0.12] -skew-x-6" />
        {/* Belt stripe — horizontal accent near bottom */}
        <div className="absolute bottom-24 left-0 right-0 h-px bg-white/5 -rotate-1" />
        {/* Top-left subtle texture */}
        <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Container>
        <div className="relative z-10 grid lg:grid-cols-[1fr_420px] gap-12 xl:gap-20 items-center py-20 md:py-24">

          {/* ── Left: Content ── */}
          <div className="flex flex-col gap-7 animate-fade-in-up">

            {/* Location label */}
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-label-md text-white/50 uppercase tracking-[0.12em]">
                {settings.district} · Türkiye
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-white leading-[0.95] tracking-tight">
              <span className="block text-[clamp(3rem,8vw,5.5rem)]">
                {settings.hero_headline}
              </span>
              <span className="block text-[clamp(3rem,8vw,5.5rem)] text-gradient-primary italic">
                {settings.hero_highlight}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-body-lg text-white/65 max-w-lg leading-relaxed">
              {settings.hero_subtext}
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 items-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(heroContent.cta_primary_href)}
                className="shadow-primary-glow"
              >
                {heroContent.cta_primary_label}
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(heroContent.cta_secondary_href)}
              >
                {heroContent.cta_secondary_label}
              </Button>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
              {academyStats.map((stat, i) => (
                <div key={i} className="flex items-baseline gap-1.5">
                  <span className="font-display font-bold text-white text-xl">
                    {stat.value}
                  </span>
                  <span className="text-body-sm text-white/45">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Stats card (desktop only) ── */}
          <div className="hidden lg:flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {/* Main stat card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-7 flex flex-col gap-6">

              {/* KBA mark */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-primary-glow/20">
                  <span className="font-display font-black text-white text-sm tracking-tight">KBA</span>
                </div>
                <div>
                  <p className="font-display font-bold text-white text-sm leading-tight">Kerime Balaban</p>
                  <p className="text-label-sm text-primary uppercase tracking-widest">Akademi</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-5">
                {academyStats.map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="font-display font-black text-white text-3xl leading-none">
                      {stat.value}
                    </span>
                    <span className="text-label-sm text-white/45 leading-tight">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tagline */}
              <p className="text-body-sm text-white/40 border-t border-white/10 pt-4 italic">
                "{academyInfo.tagline}"
              </p>
            </div>

            {/* Schedule preview card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-label-sm text-white/40 uppercase tracking-widest mb-1">Antrenman Günleri</p>
                <p className="font-display font-semibold text-white text-sm">
                  Pazartesi · Çarşamba · Cuma
                </p>
              </div>
              <div className="flex gap-1.5">
                {['P', 'Ç', 'C'].map((d) => (
                  <span
                    key={d}
                    className="w-8 h-8 rounded-md bg-secondary-container/20 border border-secondary/20 flex items-center justify-center text-label-sm font-bold text-secondary-light"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </Container>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-30">
        <div className="w-px h-8 bg-white/40" />
      </div>
    </section>
  )
}

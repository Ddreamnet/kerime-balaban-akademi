import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export function HeroSection() {
  const navigate = useNavigate()
  const settings = useSiteSettings()

  return (
    <section className="relative bg-on-surface overflow-hidden min-h-[85dvh] flex items-start -mt-16 pt-16">
      {/* ── Background layers ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Deep red diagonal bands */}
        <div className="absolute -right-20 top-0 h-full w-2/5 bg-gradient-primary opacity-[0.07] -skew-x-6" />
        <div className="absolute -right-6 top-0 h-full w-1/4 bg-gradient-primary opacity-[0.12] -skew-x-6" />
        {/* Top-left glow */}
        <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        {/* Impact energy burst — behind the kick */}
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] hidden lg:block" />
        {/* Subtle radial lines from kick impact point */}
        <div className="absolute right-[30%] top-[45%] w-[300px] h-[2px] bg-gradient-to-l from-primary/20 to-transparent -rotate-12 hidden lg:block" />
        <div className="absolute right-[28%] top-[50%] w-[250px] h-[2px] bg-gradient-to-l from-primary/15 to-transparent -rotate-3 hidden lg:block" />
        <div className="absolute right-[30%] top-[55%] w-[200px] h-[2px] bg-gradient-to-l from-primary/10 to-transparent rotate-6 hidden lg:block" />
      </div>

      <Container>
        <div className="relative z-10 grid lg:grid-cols-[1fr_1fr] gap-8 xl:gap-0 lg:items-start pt-10 md:pt-12 lg:pt-4 pb-8 md:pb-12">

          {/* ── Left: Content — "pushed" by the kick ── */}
          <div className="flex flex-col gap-6 lg:pr-8 lg:mt-10 xl:mt-16">

            {/* Overline */}
            <div className="overflow-hidden">
              <p
                className="text-label-md text-primary uppercase tracking-[0.2em] font-semibold animate-fade-in-up"
              >
                {settings.home_hero_overline}
              </p>
            </div>

            {/* Headline — staircase layout: each line indented further right */}
            <h1 className="flex flex-col -space-y-1 md:-space-y-2">
              <div className="overflow-hidden">
                <span
                  className="block font-display font-black text-white uppercase leading-[0.95] tracking-tight text-[clamp(3rem,9vw,6.5rem)] animate-hero-push-1"
                >
                  Kerime
                </span>
              </div>
              <div className="overflow-hidden pl-[clamp(1.5rem,4vw,3.5rem)]">
                <span
                  className="block font-display font-black text-white uppercase leading-[0.95] tracking-tight text-[clamp(3rem,9vw,6.5rem)] animate-hero-push-2"
                >
                  Balaban
                </span>
              </div>
              <div className="overflow-hidden pl-[clamp(3rem,8vw,7rem)]">
                <span
                  className="block font-display font-black uppercase leading-[0.95] tracking-tight text-[clamp(3rem,9vw,6.5rem)] text-gradient-primary animate-hero-push-3"
                >
                  Akademi
                </span>
              </div>
            </h1>

            {/* Subtext */}
            <p
              className="text-body-lg text-white/60 max-w-md leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
            >
              {settings.hero_subtext}
            </p>

            {/* CTA row */}
            <div
              className="flex flex-wrap gap-3 items-center animate-fade-in-up"
              style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(settings.hero_cta_primary_href)}
                className="shadow-primary-glow"
              >
                {settings.hero_cta_primary_label}
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(settings.hero_cta_secondary_href)}
              >
                {settings.hero_cta_secondary_label}
              </Button>
            </div>

            {/* Trust bar */}
            <div
              className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 animate-fade-in-up"
              style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
            >
              {settings.academy_stats.map((stat, i) => (
                <div key={i} className="flex items-baseline gap-1.5">
                  <span className="font-display font-bold text-white text-xl">
                    {stat.value}
                  </span>
                  <span className="text-body-sm text-white/45">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Kick image ── */}
          <div className="hidden lg:flex items-center justify-center relative lg:-mt-4 xl:-mt-8">
            {/* Impact shockwave rings */}
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border border-primary/20 animate-shockwave-1" />
              <div className="absolute inset-0 w-32 h-32 rounded-full border border-primary/10 animate-shockwave-2" />
              <div className="absolute inset-0 w-32 h-32 rounded-full border border-primary/5 animate-shockwave-3" />
            </div>

            {/* Speed lines — emphasize the kick direction */}
            <div className="absolute left-0 top-[42%] w-24 h-[3px] bg-gradient-to-l from-white/15 to-transparent animate-speed-line-1" />
            <div className="absolute left-4 top-[46%] w-16 h-[2px] bg-gradient-to-l from-primary/25 to-transparent animate-speed-line-2" />
            <div className="absolute left-2 top-[50%] w-20 h-[2px] bg-gradient-to-l from-white/10 to-transparent animate-speed-line-3" />

            {/* The kicker */}
            <img
              src="/images/KickTheAir.webp"
              alt="Taekwondo tekme"
              className="relative z-10 w-full max-w-[520px] h-auto object-contain drop-shadow-[0_0_60px_rgba(183,19,26,0.3)] animate-kick-enter select-none"
              draggable={false}
            />

            {/* Ground reflection glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary/10 blur-3xl rounded-full" />
          </div>

          {/* ── Mobile: Kick image (simplified) ── */}
          <div className="flex lg:hidden justify-center relative -mt-4">
            <img
              src="/images/KickTheAir.webp"
              alt="Taekwondo tekme"
              className="w-72 h-auto object-contain drop-shadow-[0_0_40px_rgba(183,19,26,0.25)] animate-kick-enter select-none"
              draggable={false}
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-primary/10 blur-2xl rounded-full" />
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

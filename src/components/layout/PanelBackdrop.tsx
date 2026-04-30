import { cn } from '@/utils/cn'

interface PanelBackdropProps {
  /**
   * 'fixed' (default) — viewport'a sabitli, dashboard panellerinde sayfa
   * boyunca görünür; 'absolute' — parent container'a göre konumlanır,
   * Header/Footer'lı sayfalarda (ör. login/register) kullanılır.
   */
  variant?: 'fixed' | 'absolute'
}

/**
 * Ambient backdrop for admin/coach/parent dashboard panels.
 *
 * Concept: "Asymmetric Ink Composition" — borrowed from East Asian
 * calligraphy and Korean seal art. Built entirely from SVG paths over a
 * mesh-gradient atmosphere; no images, no `background-attachment: fixed`
 * (broken on iOS Safari).
 */
export function PanelBackdrop({ variant = 'fixed' }: PanelBackdropProps = {}) {
  return (
    <div
      className={cn(
        variant === 'fixed' ? 'fixed' : 'absolute',
        'inset-0 z-0 pointer-events-none overflow-hidden panel-mesh-bg',
      )}
      aria-hidden="true"
    >
      {/* ── Main composition SVG ──────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1600 1200"
      >
        <defs>
          {/* Tapered gradients — opacity ramps up at center, fades at ends */}
          <linearGradient id="ink-stroke-primary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#b7131a" stopOpacity="0" />
            <stop offset="22%"  stopColor="#b7131a" stopOpacity="0.22" />
            <stop offset="55%"  stopColor="#b7131a" stopOpacity="0.11" />
            <stop offset="100%" stopColor="#b7131a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ink-stroke-wine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3B1E1E" stopOpacity="0" />
            <stop offset="28%"  stopColor="#3B1E1E" stopOpacity="0.20" />
            <stop offset="70%"  stopColor="#3B1E1E" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#3B1E1E" stopOpacity="0" />
          </linearGradient>

          {/* Subtle paper grain — turbulence noise composited dark */}
          <filter id="ink-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.95"
              numOctaves="2"
              seed="9"
            />
            <feColorMatrix
              values="
                0 0 0 0 0.18
                0 0 0 0 0.07
                0 0 0 0 0.07
                0 0 0 0.55 0"
            />
          </filter>
        </defs>

        {/* ─── Primary sweeping stroke (upper-left → lower-right arc) ──── */}
        <path
          d="M -200 280 Q 500 760, 1100 660 T 1820 1080"
          stroke="url(#ink-stroke-primary)"
          strokeWidth="170"
          fill="none"
          strokeLinecap="round"
        />
        {/* Hairline ghost — gives the brush stroke an "edge" */}
        <path
          d="M -180 295 Q 500 740, 1100 670 T 1820 1075"
          stroke="#b7131a"
          strokeOpacity="0.18"
          strokeWidth="1.2"
          fill="none"
        />

        {/* ─── Wine counter-stroke (upper-right → lower-left arc) ──────── */}
        <path
          d="M 1820 180 Q 1100 380, 700 590 T -200 920"
          stroke="url(#ink-stroke-wine)"
          strokeWidth="140"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 1820 198 Q 1100 365, 700 600 T -200 915"
          stroke="#3B1E1E"
          strokeOpacity="0.28"
          strokeWidth="0.8"
          fill="none"
        />

        {/* ─── Short "flick" accent — upper-right quadrant ─────────────── */}
        <path
          d="M 1480 80 Q 1320 60, 1180 220"
          stroke="#3B1E1E"
          strokeOpacity="0.30"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Tiny secondary flick beside it */}
        <path
          d="M 1410 130 Q 1340 130, 1290 200"
          stroke="#b7131a"
          strokeOpacity="0.22"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* ─── Ink splatter cluster 1 — upper-left ──────────────────────── */}
        <g fill="#3B1E1E">
          <circle cx="280"  cy="160" r="2.6" opacity="0.34" />
          <circle cx="320"  cy="178" r="1.2" opacity="0.22" />
          <circle cx="238"  cy="210" r="3.4" opacity="0.30" />
          <circle cx="372"  cy="222" r="1.0" opacity="0.18" />
          <circle cx="294"  cy="246" r="1.6" opacity="0.26" />
          <circle cx="198"  cy="262" r="0.8" opacity="0.20" />
          <circle cx="412"  cy="190" r="0.7" opacity="0.18" />
        </g>

        {/* ─── Ink splatter cluster 2 — lower-right ─────────────────────── */}
        <g fill="#3B1E1E">
          <circle cx="1338" cy="782" r="2.0" opacity="0.30" />
          <circle cx="1422" cy="820" r="1.5" opacity="0.24" />
          <circle cx="1280" cy="852" r="0.9" opacity="0.18" />
          <circle cx="1380" cy="902" r="2.7" opacity="0.32" />
          <circle cx="1450" cy="874" r="1.0" opacity="0.20" />
          <circle cx="1502" cy="942" r="1.7" opacity="0.24" />
          <circle cx="1248" cy="912" r="0.8" opacity="0.18" />
        </g>

        {/* ─── Tiny mid-canvas dust ─────────────────────────────────────── */}
        <g fill="#b7131a" opacity="0.4">
          <circle cx="780" cy="420" r="0.8" />
          <circle cx="820" cy="468" r="0.6" />
          <circle cx="900" cy="500" r="0.5" />
        </g>

        {/* ─── Paper grain over everything ──────────────────────────────── */}
        <rect width="1600" height="1200" filter="url(#ink-grain)" opacity="0.45" />
      </svg>

      {/* ── Asymmetric editorial rule (desktop only) ─────────────────────── */}
      <div
        className="
          hidden md:block
          absolute top-[37%] left-[8%] right-0 h-[1px]
          bg-gradient-to-r from-wine/35 via-wine/15 to-transparent
        "
      />
      {/* Tiny tick on the rule — editorial detail */}
      <div className="hidden md:block absolute top-[37%] left-[8%] -translate-y-1/2 w-1 h-2 bg-wine/40" />

      {/* ── Korean seal stamp ornament — bottom-right corner ─────────────── */}
      <div
        className="
          absolute
          bottom-6 right-6 sm:bottom-12 sm:right-12
          w-14 sm:w-20 h-14 sm:h-20
          opacity-[0.08]
        "
      >
        <SealStampSvg />
      </div>
    </div>
  )
}

// ─── Korean-style seal stamp ───────────────────────────────────────────────
//
// Square outer border with abstract brushmark inside. Reads as an "official
// stamp" without being literal Hangul or Hanja — keeps it decorative.

function SealStampSvg() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full text-wine"
      fill="none"
      stroke="currentColor"
    >
      {/* Outer double border */}
      <rect x="5"  y="5"  width="90" height="90" strokeWidth="2.5" />
      <rect x="10" y="10" width="80" height="80" strokeWidth="0.6" opacity="0.55" />

      {/* Stylized character — vertical stem with horizontal strokes */}
      <g strokeWidth="3" strokeLinecap="round">
        <line x1="50" y1="22" x2="50" y2="80" />
        <line x1="32" y1="32" x2="68" y2="32" />
        <line x1="30" y1="50" x2="70" y2="50" />
        <line x1="34" y1="68" x2="68" y2="68" />
        <line x1="68" y1="22" x2="68" y2="32" />
      </g>

      {/* Two corner accent ticks for "stamp registration" feel */}
      <g strokeWidth="1.5">
        <line x1="5"  y1="5"  x2="13" y2="5" />
        <line x1="5"  y1="5"  x2="5"  y2="13" />
        <line x1="95" y1="95" x2="87" y2="95" />
        <line x1="95" y1="95" x2="95" y2="87" />
      </g>
    </svg>
  )
}

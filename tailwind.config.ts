import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b7131a',
          dark: '#8c0e14',
          gradient: '#db322f',
          container: '#ffd5d4',
          'on-container': '#410002',
          // Soft variants for tinted hovers / accent backgrounds in panels.
          tint: '#fff5f5',     // very light primary wash
          50: '#fff5f5',
          100: '#ffe8e8',
        },
        secondary: {
          DEFAULT: '#4c56af',
          light: '#959efd',
          container: '#dfe0ff',
          'on-container': '#000b60',
          tint: '#f4f7ff',
        },
        surface: {
          DEFAULT: '#f9f9f9',
          card: '#ffffff',
          low: '#eeeeee',
          high: '#e3e3e3',
          // Warm/cool washes for panel section accents — pulled from hero palette.
          warm: '#fdf6f4',
          cool: '#f4f7ff',
          dark: '#1a1c1c',
          'dark-card': '#23262a',
        },
        'on-surface': '#1a1c1c',
        outline: '#906f6c',
        'outline-variant': 'rgba(144, 111, 108, 0.15)',
        // Wine — deep burgundy, sits between primary red and on-surface dark.
        // Used for "editorial" accents that need gravitas without screaming red.
        wine: {
          DEFAULT: '#3B1E1E',
          50: '#f8efef',     // very light wash (hover backgrounds, nav rails)
          100: '#ecd6d6',    // tinted chip / tag backgrounds
          200: '#d4a8a8',
          500: '#5c2828',    // mid wine for gradient endpoints
          700: '#2a1414',    // deeper than DEFAULT for text emphasis
          900: '#1d0e0e',    // deepest, near-black
        },
        // Semantic status palette — used by StatCard, Badge, etc.
        success: {
          DEFAULT: '#16a34a',
          tint: '#f0fdf4',
          container: '#dcfce7',
          'on-container': '#14532d',
        },
        warning: {
          DEFAULT: '#d97706',
          tint: '#fffbeb',
          container: '#fef3c7',
          'on-container': '#78350f',
        },
        info: {
          DEFAULT: '#0284c7',
          tint: '#f0f9ff',
          container: '#e0f2fe',
          'on-container': '#0c4a6e',
        },
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
        'headline-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'title-lg': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
        'title-md': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'title-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-md': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.06em', fontWeight: '600' }],
      },
      borderRadius: {
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        'full': '9999px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #b7131a 0%, #db322f 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #8c0e14 0%, #b7131a 100%)',
        'gradient-primary-soft': 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #4c56af 0%, #6e78d4 100%)',
        'gradient-secondary-soft': 'linear-gradient(135deg, #f4f7ff 0%, #dfe0ff 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1c1c 0%, #2d2f2f 100%)',
        'gradient-success': 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
        'gradient-warning': 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        // Wine: deep editorial burgundy → toward primary red gradient endpoint.
        // Pairs with gradient-primary as a more "anchored" sibling.
        'gradient-wine': 'linear-gradient(135deg, #3B1E1E 0%, #5c2828 100%)',
        'gradient-wine-soft':
          'linear-gradient(135deg, #f8efef 0%, #ecd6d6 100%)',
        // Wine + primary in the same gradient — used for premium spotlight cards.
        'gradient-wine-primary':
          'linear-gradient(135deg, #3B1E1E 0%, #b7131a 100%)',
        // Panel hero — subtle red wash on a card surface
        'gradient-panel-hero':
          'radial-gradient(120% 80% at 100% 0%, rgba(183, 19, 26, 0.12) 0%, rgba(183, 19, 26, 0) 60%), linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
        // Panel hero (dark variant)
        'gradient-panel-hero-dark':
          'radial-gradient(120% 80% at 100% 0%, rgba(219, 50, 47, 0.35) 0%, rgba(26, 28, 28, 0) 60%), linear-gradient(135deg, #1a1c1c 0%, #2d2f2f 100%)',
        // Skewed accent bands — same DNA as HeroSection
        'panel-bands':
          'linear-gradient(110deg, transparent 0%, transparent 60%, rgba(183, 19, 26, 0.06) 60%, rgba(183, 19, 26, 0.06) 70%, transparent 70%, transparent 78%, rgba(183, 19, 26, 0.04) 78%, rgba(183, 19, 26, 0.04) 84%, transparent 84%)',
      },
      boxShadow: {
        'ambient': '0 0 40px 0 rgba(26, 28, 28, 0.06)',
        'ambient-sm': '0 2px 8px 0 rgba(26, 28, 28, 0.04)',
        'ambient-md': '0 8px 60px 0 rgba(26, 28, 28, 0.10)',
        'ambient-lg': '0 16px 80px 0 rgba(26, 28, 28, 0.14)',
        'primary-glow': '0 8px 32px 0 rgba(183, 19, 26, 0.25)',
        'primary-glow-sm': '0 4px 16px 0 rgba(183, 19, 26, 0.18)',
        'secondary-glow': '0 8px 32px 0 rgba(76, 86, 175, 0.22)',
        // Wine glow — subtle, warm, "deep velvet" feel for editorial spots.
        'wine-glow': '0 8px 32px 0 rgba(59, 30, 30, 0.30)',
        'wine-glow-sm': '0 4px 16px 0 rgba(59, 30, 30, 0.22)',
        'inner-soft': 'inset 0 1px 2px 0 rgba(26, 28, 28, 0.04)',
      },
      minHeight: {
        'touch': '48px',
        'btn': '56px',
      },
      minWidth: {
        'touch': '48px',
      },
      backdropBlur: {
        'glass': '24px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Very slow rotation — used for the "dojo ring" backdrop ornament.
        'slow-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        // Reverse direction for paired rings.
        'slow-spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        // Manga "speed line" breath: stretches from the right edge while
        // its opacity oscillates. Anchored via transform-origin: right.
        'breath-line': {
          '0%, 100%': { transform: 'scaleX(0.7)', opacity: '0.25' },
          '50%': { transform: 'scaleX(1)', opacity: '0.65' },
        },
        // Slow drift — used for floating ambient elements.
        'drift': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(10px, -8px)' },
        },
        // Hero: text lines slide in from right as if "kicked"
        'hero-push-1': {
          '0%': { opacity: '0', transform: 'translateX(120px) skewX(-8deg)' },
          '60%': { opacity: '1', transform: 'translateX(-12px) skewX(2deg)' },
          '80%': { transform: 'translateX(4px) skewX(-0.5deg)' },
          '100%': { opacity: '1', transform: 'translateX(0) skewX(0)' },
        },
        'hero-push-2': {
          '0%': { opacity: '0', transform: 'translateX(160px) skewX(-10deg)' },
          '60%': { opacity: '1', transform: 'translateX(-16px) skewX(3deg)' },
          '80%': { transform: 'translateX(6px) skewX(-1deg)' },
          '100%': { opacity: '1', transform: 'translateX(0) skewX(0)' },
        },
        'hero-push-3': {
          '0%': { opacity: '0', transform: 'translateX(200px) skewX(-12deg)' },
          '60%': { opacity: '1', transform: 'translateX(-20px) skewX(4deg)' },
          '80%': { transform: 'translateX(8px) skewX(-1.5deg)' },
          '100%': { opacity: '1', transform: 'translateX(0) skewX(0)' },
        },
        // Hero: kick image enters from right
        'kick-enter': {
          '0%': { opacity: '0', transform: 'translateX(80px) scale(0.9)' },
          '50%': { opacity: '1', transform: 'translateX(-8px) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        // Impact shockwaves expanding outward from kick
        'shockwave-1': {
          '0%': { transform: 'scale(0.3)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'shockwave-2': {
          '0%': { transform: 'scale(0.3)', opacity: '0.8' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        'shockwave-3': {
          '0%': { transform: 'scale(0.3)', opacity: '0.5' },
          '100%': { transform: 'scale(3.5)', opacity: '0' },
        },
        // Speed lines shooting left from kick
        'speed-line-1': {
          '0%': { opacity: '0', transform: 'translateX(40px) scaleX(0)' },
          '50%': { opacity: '1', transform: 'translateX(0) scaleX(1)' },
          '100%': { opacity: '0', transform: 'translateX(-20px) scaleX(0.5)' },
        },
        'speed-line-2': {
          '0%': { opacity: '0', transform: 'translateX(30px) scaleX(0)' },
          '60%': { opacity: '1', transform: 'translateX(0) scaleX(1)' },
          '100%': { opacity: '0', transform: 'translateX(-15px) scaleX(0.3)' },
        },
        'speed-line-3': {
          '0%': { opacity: '0', transform: 'translateX(35px) scaleX(0)' },
          '55%': { opacity: '1', transform: 'translateX(0) scaleX(1)' },
          '100%': { opacity: '0', transform: 'translateX(-18px) scaleX(0.4)' },
        },
      },
      animation: {
        'slide-in-left': 'slide-in-left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-out-right': 'slide-out-right 0.25s ease-in forwards',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'soft-pulse': 'soft-pulse 2.4s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'slow-spin': 'slow-spin 90s linear infinite',
        'slow-spin-reverse': 'slow-spin-reverse 120s linear infinite',
        'breath-line': 'breath-line 6s ease-in-out infinite',
        'drift': 'drift 18s ease-in-out infinite',
        'hero-push-1': 'hero-push-1 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        'hero-push-2': 'hero-push-2 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        'hero-push-3': 'hero-push-3 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
        'kick-enter': 'kick-enter 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0s both',
        'shockwave-1': 'shockwave-1 2s ease-out 0.6s infinite',
        'shockwave-2': 'shockwave-2 2s ease-out 1.2s infinite',
        'shockwave-3': 'shockwave-3 2s ease-out 1.8s infinite',
        'speed-line-1': 'speed-line-1 1.5s ease-out 0.3s infinite',
        'speed-line-2': 'speed-line-2 1.5s ease-out 0.5s infinite',
        'speed-line-3': 'speed-line-3 1.5s ease-out 0.7s infinite',
      },
    },
  },
  plugins: [],
}

export default config

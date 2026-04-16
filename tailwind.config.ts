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
        },
        secondary: {
          DEFAULT: '#4c56af',
          light: '#959efd',
          container: '#dfe0ff',
          'on-container': '#000b60',
        },
        surface: {
          DEFAULT: '#f9f9f9',
          card: '#ffffff',
          low: '#eeeeee',
          high: '#e3e3e3',
        },
        'on-surface': '#1a1c1c',
        outline: '#906f6c',
        'outline-variant': 'rgba(144, 111, 108, 0.15)',
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
        'gradient-dark': 'linear-gradient(135deg, #1a1c1c 0%, #2d2f2f 100%)',
      },
      boxShadow: {
        'ambient': '0 0 40px 0 rgba(26, 28, 28, 0.06)',
        'ambient-md': '0 8px 60px 0 rgba(26, 28, 28, 0.10)',
        'ambient-lg': '0 16px 80px 0 rgba(26, 28, 28, 0.14)',
        'primary-glow': '0 8px 32px 0 rgba(183, 19, 26, 0.25)',
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
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-out-right': 'slide-out-right 0.25s ease-in forwards',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

export default config

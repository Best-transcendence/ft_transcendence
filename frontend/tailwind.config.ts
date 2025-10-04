import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg1': 'var(--color-bg-1)',
        'theme-bg2': 'var(--color-bg-2)',
        'theme-accent1': 'var(--color-accent-1)',
        'theme-accent2': 'var(--color-accent-2)',
        'theme-text': 'var(--color-text)',
        'theme-button': 'var(--color-button)',
        'theme-button-hover': 'var(--color-button-hover)',
        brand: {
          light: 'var(--color-brand-light)',
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      keyframes: {
        zoomIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
      },
      animation: {
        zoomIn: 'zoomIn 0.5s ease-out forwards',
        zoomOut: 'zoomOut 0.5s ease-in forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
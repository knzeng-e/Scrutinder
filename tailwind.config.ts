import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tokens sémantiques pilotés par des variables CSS (thème clair/sombre).
        // Définis dans app/globals.css (:root = sombre, .light = clair).
        bg:       'rgb(var(--bg) / <alpha-value>)',
        surface:  'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface-2) / <alpha-value>)',
        surface3: 'rgb(var(--surface-3) / <alpha-value>)',
        line:     'rgb(var(--line) / <alpha-value>)',
        ink:      'rgb(var(--ink) / <alpha-value>)',
        muted:    'rgb(var(--muted) / <alpha-value>)',
        faint:    'rgb(var(--faint) / <alpha-value>)',
        // Couleurs d'accent (identiques en clair et sombre)
        accept: '#22c55e',
        reject: '#ef4444',
        discuss: '#f59e0b',
        priority: '#6366f1',
        unclear: '#94a3b8',
        brand: {
          red: '#CC0A2B',
          dark: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config

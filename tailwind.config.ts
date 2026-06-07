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
        // ── Palette « Parlement En Commun » (affiche militante) ──────────────
        paper:      '#FFFCF4',
        paper2:     '#FBF6EA',
        violet:     '#4C0297',
        violetInk:  '#37016E',
        red:        '#D1271C',
        redInk:     '#A81910',
        lavender:   '#E5CBFF',
        pink:       '#FFD2CF',
        pinkPale:   '#FDEDFF',
        blue:       '#BEE2FF',
        blueInk:    '#175C9E',
        ink:        '#0C0D0E',
        inkSoft:    '#212320',
        gray:       '#706F6F',
        line:       '#D6D5D5',
        green:      '#5C8946',
        greenInk:   '#456A33',
        greenPale:  '#D4E9D6',

        // ── Tokens sémantiques (compat composants legacy) ────────────────────
        // Mappés sur la palette papier pour que tout reste clair et cohérent.
        bg:       '#FFFCF4',
        surface:  '#FFFFFF',
        surface2: '#FBF6EA',
        surface3: '#E5CBFF',
        muted:    '#706F6F',
        faint:    '#706F6F',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Narrow', 'sans-serif'],
        cond:    ['var(--font-cond)', 'sans-serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        r: '12px',
        '4xl': '2rem',
      },
      boxShadow: {
        // Ombres DURES décalées (pas de flou) — signature visuelle.
        'hard':       '4px 4px 0 #0C0D0E',
        'hard-sm':    '2px 2px 0 #0C0D0E',
        'hard-lg':    '5px 5px 0 #0C0D0E',
        'lav':        '4px 4px 0 #E5CBFF',
        'lav-lg':     '5px 5px 0 #E5CBFF',
        'pink':       '4px 4px 0 #FFD2CF',
        'pink-lg':    '5px 5px 0 #FFD2CF',
        'violet':     '4px 4px 0 #4C0297',
        'violet-lg':  '6px 6px 0 #4C0297',
        'blue':       '3px 3px 0 #BEE2FF',
        'green-lg':   '5px 5px 0 #5C8946',
        'line':       '2px 2px 0 #D6D5D5',
      },
      keyframes: {
        pop: {
          from: { transform: 'translateY(10px)' },
          to:   { transform: 'none' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to:   { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        pop: 'pop .35s cubic-bezier(.2,.8,.2,1)',
        slideUp: 'slideUp .28s cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
  plugins: [],
}

export default config

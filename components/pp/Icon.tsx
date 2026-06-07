import type { CSSProperties } from 'react'

// Jeu d'icônes ligne géométriques (porté du design `pp-ui.jsx`).
export const PATHS: Record<string, string> = {
  home: 'M3 11.2 12 4l9 7.2M5.5 9.6V20h13V9.6',
  cards: 'M4 9.5 12 6l8 3.5-8 3.5-8-3.5Z M4 14l8 3.5L20 14',
  book: 'M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4Z M5 4v18 M18 6H8',
  chart: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M5 21c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5',
  heart: 'M12 20s-7-4.6-7-10a4 4 0 0 1 7.5-2A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z',
  check: 'M5 12.5 10 17.5 19.5 6.5',
  x: 'M6 6l12 12 M18 6 6 18',
  star: 'M12 3.5 14.6 9l6 .7-4.5 4.1 1.3 6L12 16.7 6.6 19.8l1.3-6L3.4 9.7l6-.7Z',
  chat: 'M4 5h16v11H9l-4 4v-4H4Z',
  help: 'M9 9a3 3 0 1 1 4.3 2.7c-.9.5-1.3 1-1.3 2.1 M12 17.5h.01',
  lock: 'M6 11V8a6 6 0 0 1 12 0v3 M5 11h14v9H5Z',
  shield: 'M12 3 5 6v6c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6Z M9 12l2 2 4-4',
  finger: 'M8 11a4 4 0 0 1 8 0v3 M12 11v6 M8 14v2.5 M16 14v2 M5.5 9a8 8 0 0 1 13 0',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M16.5 16.5 21 21',
  filter: 'M3 5h18 M6 12h12 M10 19h4',
  chevR: 'M9 5l7 7-7 7',
  chevL: 'M15 5l-7 7 7 7',
  chevD: 'M5 9l7 7 7-7',
  share: 'M16 6l-4-3-4 3 M12 3v13 M5 12v8h14v-8',
  plus: 'M12 5v14 M5 12h14',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
  hash: 'M9 4 7 20 M17 4l-2 16 M4 9h16 M3 15h16',
  bolt: 'M13 3 5 13h6l-1 8 8-10h-6Z',
  flame: 'M12 3c3 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 1.5 1.5 2 2 2 0-2-1-4 1-7Z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  dots: 'M5 12h.01 M12 12h.01 M19 12h.01',
  arrowR: 'M5 12h14 M13 6l6 6-6 6',
  copy: 'M9 9h10v11H9Z M5 15V4h11',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 2',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21 8.2 15.3 8.2 12 9.5 5.5 12 3Z',
  spark: 'M12 3v5 M12 16v5 M3 12h5 M16 12h5 M6 6l3 3 M15 15l3 3 M18 6l-3 3 M9 15l-3 3',
}

export type IconName = keyof typeof PATHS

interface IconProps {
  n: IconName | string
  s?: number
  sw?: number
  fill?: boolean
  className?: string
  style?: CSSProperties
}

export function Icon({ n, s = 22, sw = 2, fill = false, className, style }: IconProps) {
  const d = PATHS[n] ?? PATHS.help
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill={fill ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {d
        .split('M')
        .filter(Boolean)
        .map((seg, i) => (
          <path key={i} d={'M' + seg} />
        ))}
    </svg>
  )
}

'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import { chapters, chapterColor } from '@/lib/poster'
import { VOTES, DIST_ORDER } from './votes'
import type { MeasureStats } from '@/lib/stats'

// ── Image de campagne (cadre papier, repli gracieux) ──────────────────────────
export function PosterImage({
  src,
  height,
  objectPosition = 'center 38%',
  rounded,
  priority,
  children,
  className,
}: {
  src: string
  height: number | string
  objectPosition?: string
  rounded?: boolean
  priority?: boolean
  children?: ReactNode
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      className={`relative overflow-hidden bg-paper2 ${className ?? ''}`}
      style={{ height, borderRadius: rounded ? 10 : undefined }}
    >
      {!failed && (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, 440px"
          className="object-cover"
          style={{ objectPosition }}
          priority={priority}
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
      {children}
    </div>
  )
}

// ── Pastille de chapitre (numéro + titre tronqué) ─────────────────────────────
export function ChapterTag({ ch, light, style }: { ch: number; light?: boolean; style?: CSSProperties }) {
  const data = chapters[ch - 1]
  return (
    <span
      className={'chip ' + (light ? '' : chapterColor(ch))}
      style={{ fontSize: 10, padding: '4px 9px', ...style }}
    >
      <span className="tag-num">{String(ch).padStart(2, '0')}</span>
      <span className="max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
        {data?.title}
      </span>
    </span>
  )
}

// ── Barre de répartition des votes ────────────────────────────────────────────
export function DistBar({ stats, h = 14 }: { stats: MeasureStats; h?: number }) {
  const t = stats.total || 1
  return (
    <div className="distbar" style={{ height: h }}>
      {DIST_ORDER.map((k) => (
        <span key={k} style={{ width: `${(stats[k] / t) * 100}%`, background: VOTES[k].color }} />
      ))}
    </div>
  )
}

// ── En-tête d'écran (titre affiche) ───────────────────────────────────────────
export function ScreenHead({
  eyebrow,
  title,
  accent = '#4C0297',
  sub,
  right,
}: {
  eyebrow?: string
  title: string
  accent?: string
  sub?: string
  right?: ReactNode
}) {
  return (
    <div style={{ padding: '14px 18px' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {eyebrow && (
            <div className="eyebrow" style={{ color: accent, marginBottom: 7 }}>
              {eyebrow}
            </div>
          )}
          <h1 className="display text-ink" style={{ fontSize: 38, lineHeight: 0.96, paddingBottom: 2 }}>
            {title}
          </h1>
          {sub && (
            <p className="text-gray" style={{ margin: '12px 0 0', fontSize: 13.5, lineHeight: 1.45, maxWidth: 300 }}>
              {sub}
            </p>
          )}
        </div>
        {right}
      </div>
    </div>
  )
}

// ── Bascule segmentée (pilules) ───────────────────────────────────────────────
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-[7px] overflow-x-auto scrollbar-none" style={{ padding: '2px 0' }}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="cond flex-none"
            style={{
              padding: '8px 13px',
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '.03em',
              border: '1.5px solid #0C0D0E',
              background: active ? '#0C0D0E' : '#fff',
              color: active ? '#fff' : '#0C0D0E',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Grande statistique colorée ────────────────────────────────────────────────
const BIG_STAT_BG: Record<string, { bg: string; ink: string }> = {
  green:  { bg: '#D4E9D6', ink: '#456A33' },
  violet: { bg: '#E5CBFF', ink: '#37016E' },
  blue:   { bg: '#BEE2FF', ink: '#175C9E' },
}

export function BigStat({ n, l, c = 'violet' }: { n: ReactNode; l: string; c?: 'green' | 'violet' | 'blue' }) {
  const { bg, ink } = BIG_STAT_BG[c]
  return (
    <div className="pp-card flex-1 shadow-hard" style={{ padding: '11px 10px', background: bg }}>
      <div className="display" style={{ fontSize: 24, color: ink }}>
        {n}
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, marginTop: 2, lineHeight: 1.1 }}>{l}</div>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { resolveStats, type MeasureStats } from '@/lib/stats'
import { computeMeta, measureImage, fmt } from '@/lib/poster'
import { Icon } from '@/components/pp/Icon'
import { PosterImage, DistBar, Segmented } from '@/components/pp/primitives'
import { useToast } from '@/components/ui/Toast'
import type { Measure, ResultsData } from '@/types'

type SortKey = 'adhesion' | 'priorite' | 'debat' | 'controverse'

const SORT_LABEL: Record<SortKey, string> = {
  adhesion: 'Plus forte adhésion',
  priorite: 'Priorité absolue',
  debat: 'Le plus débattu',
  controverse: 'Le plus clivant',
}

interface Row extends Measure {
  s: MeasureStats
}

function metric(s: MeasureStats, sort: SortKey): string {
  if (sort === 'priorite') return s.priorite + '%'
  if (sort === 'debat') return Math.round((s.discuter / (s.total || 1)) * 100) + '%'
  return s.adhesion + '%'
}

export function ResultsDashboard({ measures, results }: { measures: Measure[]; results: ResultsData }) {
  const { toast } = useToast()
  const [sort, setSort] = useState<SortKey>('adhesion')

  const meta = useMemo(() => computeMeta(results.votes, results.hash), [results])
  const rows: Row[] = useMemo(
    () => measures.map((m) => ({ ...m, s: resolveStats(m.id, results.votes?.[m.id]) })),
    [measures, results],
  )

  const ranked = useMemo(() => {
    const sorters: Record<SortKey, (a: Row, b: Row) => number> = {
      adhesion: (a, b) => b.s.adhesion - a.s.adhesion,
      priorite: (a, b) => b.s.priorite - a.s.priorite,
      debat: (a, b) => b.s.discuter / b.s.total - a.s.discuter / a.s.total,
      controverse: (a, b) => Math.abs(50 - a.s.adhesion) - Math.abs(50 - b.s.adhesion),
    }
    return [...rows].sort(sorters[sort])
  }, [rows, sort])

  const top = ranked[0]

  function copyHash() {
    navigator.clipboard
      ?.writeText(`sha256:${meta.hash}`)
      .then(() => toast('Hash copié', 'success'))
      .catch(() => {})
  }

  return (
    <div className="mx-auto max-w-[440px] pb-nav">
      <ScreenHeadRed />

      {/* méta + hash */}
      <div className="pad">
        <div className="pp-card bg-violet text-white" style={{ padding: '14px 15px', boxShadow: '5px 5px 0 #0C0D0E' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="display" style={{ fontSize: 26 }}>{fmt(meta.totalVotes)}</div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>votes exprimés</div>
            </div>
            <div className="text-right">
              <div className="display" style={{ fontSize: 26 }}>{fmt(meta.participants)}</div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>citoyens</div>
            </div>
          </div>
          <div
            className="flex items-center gap-2"
            style={{ marginTop: 14, paddingTop: 12, borderTop: '1.5px solid rgba(255,255,255,.25)' }}
          >
            <Icon n="hash" s={17} style={{ color: '#E5CBFF' }} />
            <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.85 }}>Intégrité</span>
            <span className="tag-num" style={{ fontSize: 11.5, opacity: 0.95, marginLeft: 'auto' }}>
              sha256·{meta.hash}
            </span>
            <button onClick={copyHash} className="chip lav" style={{ padding: '4px 8px', color: '#4C0297' }} aria-label="Copier le hash">
              <Icon n="copy" s={12} />
            </button>
          </div>
        </div>
      </div>

      {/* tri */}
      <div className="pad" style={{ marginTop: 16 }}>
        <Segmented<SortKey>
          value={sort}
          onChange={setSort}
          options={[
            { value: 'adhesion', label: 'Adhésion' },
            { value: 'priorite', label: 'Priorité' },
            { value: 'debat', label: 'À débattre' },
            { value: 'controverse', label: 'Controversé' },
          ]}
        />
      </div>

      {/* podium */}
      {top && (
        <div className="pad" style={{ marginTop: 14 }}>
          <Link href={`/mesures/${top.id}`} className="pp-card block overflow-hidden" style={{ boxShadow: '5px 5px 0 #E5CBFF' }}>
            <PosterImage src={measureImage(top)} height={120}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.45))' }} />
              <div className="chip red absolute" style={{ left: 12, top: 12 }}>
                <span className="display" style={{ fontSize: 13 }}>N°1</span>
              </div>
              <div className="absolute text-white" style={{ left: 12, bottom: 10, right: 12 }}>
                <div className="eyebrow" style={{ color: '#fff', opacity: 0.85 }}>{SORT_LABEL[sort]}</div>
                <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>
                  {top.title}
                </div>
              </div>
            </PosterImage>
            <div style={{ padding: '12px 14px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
                <span className="chip green">{top.s.adhesion}% adhésion</span>
                <span className="tag-num text-gray" style={{ fontSize: 11.5 }}>{fmt(top.s.total)} votes</span>
              </div>
              <DistBar stats={top.s} />
            </div>
          </Link>
        </div>
      )}

      {/* classement */}
      <div className="pad grid gap-[10px]" style={{ marginTop: 16 }}>
        {ranked.slice(1, 14).map((m, i) => (
          <Link
            key={m.id}
            href={`/mesures/${m.id}`}
            className="pp-card flex items-center gap-[11px] text-left"
            style={{ padding: '11px 12px', boxShadow: '2px 2px 0 #D6D5D5' }}
          >
            <span className="display flex-none" style={{ fontSize: 22, width: 30, color: '#706F6F' }}>{i + 2}</span>
            <div className="min-w-0 flex-1">
              <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.25, maxHeight: 33, overflow: 'hidden', marginBottom: 7 }}>
                {m.title}
              </div>
              <DistBar stats={m.s} h={10} />
            </div>
            <div className="flex-none text-right">
              <div className="display" style={{ fontSize: 19, color: '#4C0297' }}>{metric(m.s, sort)}</div>
              <div className="text-gray" style={{ fontSize: 9, fontWeight: 700 }}>
                {sort === 'priorite' ? 'prioritaire' : sort === 'debat' ? 'à débattre' : 'pour'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ScreenHeadRed() {
  return (
    <div style={{ padding: '14px 18px' }}>
      <div className="eyebrow" style={{ color: '#D1271C', marginBottom: 7 }}>Comptage en direct</div>
      <h1 className="display text-ink" style={{ fontSize: 38, lineHeight: 0.96 }}>Résultats publics</h1>
      <p className="text-gray" style={{ margin: '12px 0 0', fontSize: 13.5, lineHeight: 1.45, maxWidth: 300 }}>
        Ce que le peuple soutient, priorise et conteste - chiffres ouverts à tous.
      </p>
    </div>
  )
}

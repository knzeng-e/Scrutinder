'use client'

import { useRouter } from 'next/navigation'
import { useVotes } from '@/context/VotesContext'
import { usePoster } from '@/lib/usePoster'
import { measureImage, chapterNum, fmt } from '@/lib/poster'
import { Icon } from '@/components/pp/Icon'
import { PosterImage, ChapterTag, DistBar, BigStat } from '@/components/pp/primitives'
import { VOTES, VOTE_ORDER, DIST_ORDER } from '@/components/pp/votes'
import { MeasureCommunity } from '@/components/MeasureCommunity'
import { useToast } from '@/components/ui/Toast'
import type { Measure } from '@/types'
import type { MeasureStats } from '@/lib/stats'

function VoteLegend({ stats }: { stats: MeasureStats }) {
  const t = stats.total || 1
  return (
    <div className="grid grid-cols-2" style={{ gap: '7px 14px', marginTop: 12 }}>
      {DIST_ORDER.map((k) => (
        <div key={k} className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="border border-ink" style={{ width: 11, height: 11, borderRadius: 3, background: VOTES[k].color }} />
            <span style={{ fontWeight: 700, fontSize: 12 }}>{VOTES[k].label}</span>
          </span>
          <span className="tag-num text-gray" style={{ fontSize: 12 }}>
            {Math.round((stats[k] / t) * 100)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export function MeasureDetail({ measure }: { measure: Measure }) {
  const router = useRouter()
  const { votes, recordVote } = useVotes()
  const { stat, meta } = usePoster()
  const { toast } = useToast()
  const s = stat(measure.id)
  const my = votes[measure.id]
  const ch = chapterNum(measure)

  function back() {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) await navigator.share({ title: measure.title, url })
      else {
        await navigator.clipboard.writeText(url)
        toast('Lien copié', 'success')
      }
    } catch {
      /* annulé */
    }
  }

  function copyHash() {
    navigator.clipboard
      ?.writeText(`sha256:${meta.hash}${measure.id.toString(16)}`)
      .then(() => toast('Hash copié', 'success'))
      .catch(() => {})
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-[440px] bg-paper pb-nav" style={{ paddingBottom: 120 }}>
      {/* hero */}
      <div className="relative">
        <PosterImage src={measureImage(measure)} height={228} objectPosition="center 30%" priority>
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg,rgba(0,0,0,.28),transparent 40%,transparent 70%,#FFFCF4)' }}
          />
        </PosterImage>
        <button
          onClick={back}
          aria-label="Retour"
          className="absolute flex items-center justify-center border-2 border-ink bg-white"
          style={{ left: 14, top: 14, width: 42, height: 42, borderRadius: 12, boxShadow: '2px 2px 0 #0C0D0E' }}
        >
          <Icon n="chevL" s={20} />
        </button>
        <button
          onClick={share}
          aria-label="Partager"
          className="absolute flex items-center justify-center border-2 border-ink bg-white"
          style={{ right: 14, top: 14, width: 42, height: 42, borderRadius: 12, boxShadow: '2px 2px 0 #0C0D0E' }}
        >
          <Icon n="share" s={18} />
        </button>
        <div className="absolute flex items-center gap-[6px]" style={{ left: 16, bottom: 12 }}>
          <ChapterTag ch={ch} />
          {measure.isKeyMeasure && (
            <span className="chip violet">
              <Icon n="star" s={11} fill /> Clé
            </span>
          )}
        </div>
      </div>

      <div className="pad" style={{ marginTop: 4 }}>
        <div className="eyebrow text-gray">
          Mesure N°{measure.id} · {measure.section}
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 25, lineHeight: 1.18, marginTop: 8 }}>{measure.title}</h1>

        {/* votre vote */}
        <div className="pp-card" style={{ marginTop: 16, padding: '14px 15px', boxShadow: '4px 4px 0 #E5CBFF' }}>
          <div className="eyebrow" style={{ color: '#4C0297', marginBottom: 10 }}>
            {my ? 'Votre vote' : 'Votre avis'}
          </div>
          <div className="flex justify-between gap-[7px]">
            {VOTE_ORDER.map((k) => {
              const v = VOTES[k]
              const on = my === k
              return (
                <button
                  key={k}
                  onClick={() => recordVote(measure.id, on ? null : k)}
                  className="flex flex-1 flex-col items-center gap-[5px] border-[1.5px] border-ink"
                  style={{
                    padding: '9px 2px',
                    borderRadius: 11,
                    background: on ? v.color : '#fff',
                    color: on ? '#fff' : v.color,
                    boxShadow: on ? 'none' : `2px 2px 0 ${v.bg}`,
                  }}
                >
                  <Icon n={v.icon} s={20} fill={on && (k === 'pour' || k === 'prioritaire')} />
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: on ? '#fff' : '#0C0D0E' }}>{v.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* résultats */}
        <div className="flex items-center justify-between" style={{ margin: '22px 0 8px' }}>
          <h3 className="display" style={{ fontSize: 20, lineHeight: 1.0 }}>Résultats publics</h3>
          <span className="tag-num text-gray" style={{ fontSize: 12 }}>{fmt(s.total)} votes</span>
        </div>
        <div className="flex gap-[10px]" style={{ marginBottom: 12 }}>
          <BigStat n={s.adhesion + '%'} l="adhésion" c="green" />
          <BigStat n={s.priorite + '%'} l="jugé prioritaire" c="violet" />
          <BigStat n={Math.round((s.discuter / (s.total || 1)) * 100) + '%'} l="à débattre" c="blue" />
        </div>
        <DistBar stats={s} h={16} />
        <VoteLegend stats={s} />

        {/* transparence */}
        <div className="pp-card flex items-center gap-[11px]" style={{ marginTop: 18, padding: '12px 14px', background: '#FBF6EA' }}>
          <Icon n="hash" s={20} className="flex-none" style={{ color: '#4C0297' }} />
          <div className="flex-1">
            <div style={{ fontWeight: 800, fontSize: 12 }}>Hash d’intégrité</div>
            <div className="tag-num text-gray break-all" style={{ fontSize: 11 }}>
              sha256·{meta.hash}{measure.id.toString(16)}
            </div>
          </div>
          <button onClick={copyHash} className="chip" aria-label="Copier le hash">
            <Icon n="copy" s={13} />
          </button>
        </div>

        {/* discussion + boîte à idées */}
        <MeasureCommunity measureId={measure.id} />

        {/* lien programme */}
        {measure.programUrl && (
          <a
            href={measure.programUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cond block"
            style={{ marginTop: 18, color: '#4C0297', fontWeight: 600, fontSize: 13 }}
          >
            Lire dans le programme ↗
          </a>
        )}
      </div>
    </div>
  )
}

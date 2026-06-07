'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useIdentity } from '@/context/IdentityContext'
import { useVotes } from '@/context/VotesContext'
import { usePoster } from '@/lib/usePoster'
import { measures } from '@/lib/measures'
import { fmt, chapterNum, measureImage } from '@/lib/poster'
import { Icon } from '@/components/pp/Icon'
import { PosterImage, ChapterTag } from '@/components/pp/primitives'
import type { Measure } from '@/types'
import type { MeasureStats } from '@/lib/stats'

function MiniCard({ m, stats, badge, href }: { m: Measure; stats: MeasureStats; badge?: string; href: string }) {
  return (
    <Link href={href} className="pp-card shadow-lav flex-none overflow-hidden text-left" style={{ width: 208, background: '#fff' }}>
      <PosterImage src={measureImage(m)} height={104} objectPosition="center 32%">
        <div className="absolute" style={{ left: 8, top: 8 }}>
          <ChapterTag ch={chapterNum(m)} />
        </div>
        {badge && (
          <div className="chip violet absolute" style={{ right: 8, top: 8 }}>
            {badge}
          </div>
        )}
      </PosterImage>
      <div style={{ padding: '10px 11px 12px' }}>
        <div style={{ fontWeight: 800, fontSize: 13.5, lineHeight: 1.25, height: 51, overflow: 'hidden' }}>{m.title}</div>
        <div className="flex items-center justify-between" style={{ marginTop: 9 }}>
          <span className="chip green" style={{ fontSize: 10, padding: '3px 8px' }}>
            {stats.adhesion}% pour
          </span>
          <span className="tag-num text-gray" style={{ fontSize: 11 }}>
            {fmt(stats.total)} votes
          </span>
        </div>
      </div>
    </Link>
  )
}

function SectionHead({ title, eyebrow, moreHref }: { title: string; eyebrow?: string; moreHref?: string }) {
  return (
    <div className="pad flex items-end justify-between" style={{ margin: '22px 0 12px' }}>
      <div>
        {eyebrow && <div className="eyebrow text-gray" style={{ marginBottom: 3 }}>{eyebrow}</div>}
        <h3 className="display" style={{ fontSize: 24, lineHeight: 1.0 }}>{title}</h3>
      </div>
      {moreHref && (
        <Link href={moreHref} className="cond" style={{ color: '#4C0297', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em' }}>
          Tout voir →
        </Link>
      )}
    </div>
  )
}

export function Home() {
  const { identity, guest } = useIdentity()
  const { votedCount } = useVotes()
  const { stat, meta } = usePoster()
  const router = useRouter()
  const pseudo = identity?.pseudonym || (guest ? 'Invité·e' : 'Citoyen·ne')

  const topPrio = useMemo(
    () => [...measures].sort((a, b) => stat(b.id).priorite - stat(a.id).priorite).slice(0, 6),
    [stat],
  )
  const topDebat = useMemo(
    () =>
      [...measures]
        .sort((a, b) => stat(b.id).discuter / stat(b.id).total - stat(a.id).discuter / stat(a.id).total)
        .slice(0, 5),
    [stat],
  )

  return (
    <div className="mx-auto max-w-[440px] pb-nav">
      {/* salutation */}
      <div className="pad flex items-center justify-between" style={{ paddingTop: 14, paddingBottom: 6 }}>
        <div>
          <div className="eyebrow text-gray">Bonjour</div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{pseudo}</div>
        </div>
        <Link href="/compte" className="chip lav" style={{ padding: '7px 11px' }}>
          <Icon n="shield" s={16} />
          <span style={{ fontWeight: 800, fontSize: 11 }}>Voix protégée</span>
        </Link>
      </div>

      {/* hero poster CTA */}
      <div className="pad">
        <div className="relative overflow-hidden border-2 border-ink bg-violet text-white" style={{ borderRadius: 16, boxShadow: '5px 5px 0 #0C0D0E' }}>
          <div className="absolute rounded-full bg-red" style={{ right: -26, top: -26, width: 120, height: 120 }} />
          <div className="relative" style={{ padding: '20px 20px 18px' }}>
            <div className="eyebrow" style={{ color: '#E5CBFF' }}>Session du jour</div>
            <h2 className="display" style={{ fontSize: 34, marginTop: 6 }}>
              Votez les
              <br />
              mesures
            </h2>
            <p style={{ fontSize: 13, opacity: 0.92, marginTop: 8, maxWidth: 230 }}>
              8 mesures tirées du programme vous attendent.
            </p>
            <button
              onClick={() => router.push('/swipe')}
              className="btn"
              style={{ marginTop: 16, background: '#fff', color: '#4C0297', boxShadow: '3px 3px 0 #E5CBFF' }}
            >
              <Icon n="cards" s={18} /> Commencer le vote
            </button>
          </div>
        </div>
      </div>

      {/* bandeau stats */}
      <div className="pad" style={{ marginTop: 16 }}>
        <div className="flex gap-[10px]">
          {([
            [fmt(meta.participants), 'citoyens', '#E5CBFF'],
            [fmt(meta.totalVotes), 'votes exprimés', '#FFD2CF'],
            [fmt(meta.measuresTotal), 'mesures', '#BEE2FF'],
          ] as const).map(([n, l, c], i) => (
            <div key={i} className="pp-card flex-1" style={{ padding: '12px 11px', background: c, boxShadow: '3px 3px 0 #0C0D0E' }}>
              <div className="display" style={{ fontSize: 23 }}>{n}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 2, lineHeight: 1.1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* progression */}
      {votedCount > 0 && (
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="pp-card shadow-lav" style={{ padding: '13px 15px' }}>
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 800, fontSize: 13 }}>Vos votes</span>
              <span className="tag-num" style={{ color: '#4C0297' }}>{votedCount}</span>
            </div>
            <p className="text-gray" style={{ fontSize: 12, marginTop: 4 }}>Continuez à faire entendre votre voix.</p>
          </div>
        </div>
      )}

      {/* Priorités populaires */}
      <SectionHead title="Priorités populaires" eyebrow="Le plus jugé urgent" moreHref="/resultats" />
      <div className="flex gap-3 overflow-x-auto scrollbar-none" style={{ padding: '2px 18px 6px' }}>
        {topPrio.map((m, i) => (
          <MiniCard key={m.id} m={m} stats={stat(m.id)} badge={i < 3 ? '★ Prioritaire' : undefined} href={`/mesures/${m.id}`} />
        ))}
      </div>

      {/* À débattre */}
      <SectionHead title="À débattre" eyebrow="La discussion fait rage" moreHref="/resultats" />
      <div className="pad grid gap-[10px]">
        {topDebat.map((m) => {
          const s = stat(m.id)
          return (
            <Link
              key={m.id}
              href={`/mesures/${m.id}`}
              className="pp-card flex items-center gap-[11px] text-left"
              style={{ padding: '11px 12px', boxShadow: '3px 3px 0 #BEE2FF' }}
            >
              <PosterImage src={measureImage(m)} height={52} className="w-[52px] flex-none" rounded>
                <div className="absolute inset-0 border-[1.5px] border-ink" style={{ borderRadius: 8 }} />
              </PosterImage>
              <div className="min-w-0 flex-1">
                <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.25, maxHeight: 33, overflow: 'hidden' }}>{m.title}</div>
                <div className="flex gap-[6px]" style={{ marginTop: 5 }}>
                  <span className="chip blue" style={{ fontSize: 9.5, padding: '3px 7px' }}>
                    <Icon n="chat" s={11} /> {Math.round((s.discuter / s.total) * 100)}% à discuter
                  </span>
                </div>
              </div>
              <Icon n="chevR" s={18} className="flex-none text-gray" />
            </Link>
          )
        })}
      </div>

      {/* Contribuer */}
      <div className="pad" style={{ marginTop: 18 }}>
        <div className="pp-card relative overflow-hidden bg-red text-white" style={{ padding: 18, boxShadow: '5px 5px 0 #0C0D0E' }}>
          <div className="absolute" style={{ right: -20, bottom: -26, opacity: 0.22 }}>
            <Icon n="spark" s={120} sw={1.4} />
          </div>
          <div className="eyebrow relative" style={{ color: '#FFD2CF' }}>Boîte à idées</div>
          <h3 className="display relative" style={{ fontSize: 26, marginTop: 6 }}>
            Contribuer au
            <br />
            programme
          </h3>
          <p className="relative" style={{ fontSize: 13, opacity: 0.95, marginTop: 8, maxWidth: 240 }}>
            Proposez une mesure, amendez une idée. Le peuple écrit son programme.
          </p>
          <Link href="/programme" className="btn btn-sm relative" style={{ marginTop: 14, background: '#fff', color: '#D1271C', boxShadow: '3px 3px 0 #0C0D0E' }}>
            <Icon n="plus" s={16} /> Proposer une mesure
          </Link>
        </div>
      </div>
    </div>
  )
}

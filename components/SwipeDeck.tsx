'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import Link from 'next/link'
import { useVotes } from '@/context/VotesContext'
import { measureImage, chapterNum } from '@/lib/poster'
import { Icon } from '@/components/pp/Icon'
import { ChapterTag } from '@/components/pp/primitives'
import { VOTES } from '@/components/pp/votes'
import type { Measure, VoteChoice } from '@/types'

const ROUND_SIZE = 8
const SWIPE_X = 110
const SWIPE_Y = 110

const FLY: Record<VoteChoice, { x: number; y: number }> = {
  pour: { x: 520, y: 40 },
  contre: { x: -520, y: 40 },
  prioritaire: { x: 30, y: -640 },
  discuter: { x: 30, y: 640 },
  incompris: { x: 560, y: -200 },
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Tirage pondéré vers les mesures clés.
function pickSession(all: Measure[]): Measure[] {
  const keys = shuffle(all.filter((m) => m.isKeyMeasure)).slice(0, 5)
  const rest = shuffle(all.filter((m) => !m.isKeyMeasure)).slice(0, 3)
  return shuffle([...keys, ...rest]).slice(0, ROUND_SIZE)
}

// ── Boutons d'action ronds ────────────────────────────────────────────────────
function ActBtn({ choice, onClick, big, primary }: { choice: VoteChoice; onClick: () => void; big?: boolean; primary?: boolean }) {
  const v = VOTES[choice]
  const size = primary ? 64 : big ? 50 : 46
  return (
    <button
      onClick={onClick}
      aria-label={v.label}
      className="flex flex-none items-center justify-center border-2 border-ink transition-transform active:translate-x-[2px] active:translate-y-[2px]"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: primary ? v.color : '#fff',
        color: primary ? '#fff' : v.color,
        boxShadow: `3px 3px 0 ${v.bg}`,
      }}
    >
      <Icon n={v.icon} s={primary ? 30 : 23} fill={choice === 'pour' || choice === 'prioritaire'} />
    </button>
  )
}

// ── Carte de mesure ─────────────────────────────────────────────────────────
function SwipeCardFace({ m, live }: { m: Measure; live: VoteChoice | null }) {
  return (
    <div className="pp-card no-select flex h-full flex-col overflow-hidden" style={{ boxShadow: '6px 6px 0 #E5CBFF', background: '#fff' }}>
      <div className="relative" style={{ flex: '0 0 44%', minHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={measureImage(m)}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={{ objectPosition: 'center 32%' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="absolute" style={{ left: 10, top: 10 }}>
          <ChapterTag ch={chapterNum(m)} />
        </div>
        <div className="chip absolute" style={{ right: 10, top: 10 }}>
          <span className="tag-num">N°{m.id}</span>
        </div>
        {m.isKeyMeasure && (
          <div className="chip violet absolute" style={{ left: 10, bottom: 10 }}>
            <Icon n="star" s={12} fill /> Mesure clé
          </div>
        )}
        {live && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: VOTES[live].color + '26' }}>
            <div
              className="display"
              style={{
                fontSize: 34,
                color: '#fff',
                border: '4px solid #fff',
                padding: '8px 16px',
                borderRadius: 12,
                transform: 'rotate(-8deg)',
                background: VOTES[live].color,
                boxShadow: '4px 4px 0 rgba(0,0,0,.35)',
              }}
            >
              {VOTES[live].verb}
            </div>
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col" style={{ padding: '14px 16px 12px' }}>
        <div className="eyebrow text-gray overflow-hidden text-ellipsis whitespace-nowrap" style={{ marginBottom: 7 }}>
          {m.section}
        </div>
        <h3 className="min-h-0 flex-1 overflow-hidden" style={{ fontWeight: 800, fontSize: 19, lineHeight: 1.16, margin: 0 }}>
          {m.title}
        </h3>
        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
          <span className="text-gray" style={{ fontSize: 11.5, fontWeight: 700 }}>
            Chapitre {String(chapterNum(m)).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Fin de session ────────────────────────────────────────────────────────────
function SwipeDone({ count, total, onAgain }: { count: number; total: number; onAgain: () => void }) {
  return (
    <div className="mx-auto max-w-[440px] pb-nav text-center" style={{ padding: '30px 22px' }}>
      <div className="animate-pop">
        <div className="mb-[18px] flex justify-center">
          <div
            className="flex items-center justify-center border-2 border-ink"
            style={{ width: 96, height: 96, borderRadius: 24, background: '#D4E9D6', color: '#456A33', boxShadow: '5px 5px 0 #5C8946' }}
          >
            <Icon n="check" s={52} />
          </div>
        </div>
        <div className="eyebrow" style={{ color: '#456A33' }}>Session terminée</div>
        <h2 className="display" style={{ fontSize: 34, marginTop: 8 }}>
          Votre voix
          <br />
          est comptée
        </h2>
        <p className="text-gray" style={{ fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>
          Vous avez voté {count} mesures. Au total&nbsp;: <b style={{ color: '#4C0297' }}>{total} votes</b> chiffrés sur votre appareil.
        </p>
        <div className="grid gap-[11px] text-left" style={{ marginTop: 24 }}>
          <Link href="/resultats" className="btn btn-violet btn-block">
            <Icon n="chart" s={18} /> Voir les résultats publics
          </Link>
          <button onClick={onAgain} className="btn btn-ghost btn-block">
            <Icon n="cards" s={18} /> Nouvelle session
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Deck ──────────────────────────────────────────────────────────────────────
export function SwipeDeck({ measures: all }: { measures: Measure[] }) {
  const { recordVote, votedCount } = useVotes()

  const [deck, setDeck] = useState<Measure[]>(() => pickSession(all))
  const [idx, setIdx] = useState(0)
  const [live, setLive] = useState<VoteChoice | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const flying = useRef(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, (v) => v * 0.05)

  const done = idx >= deck.length
  const current = deck[idx]

  const choiceFromOffset = useCallback((dx: number, dy: number): VoteChoice | null => {
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > SWIPE_X) return 'pour'
      if (dx < -SWIPE_X) return 'contre'
    } else {
      if (dy < -SWIPE_Y) return 'prioritaire'
      if (dy > SWIPE_Y) return 'discuter'
    }
    return null
  }, [])

  const commit = useCallback(
    (choice: VoteChoice) => {
      if (flying.current || !current) return
      flying.current = true
      const vec = FLY[choice]
      animate(x, vec.x, { duration: 0.26, ease: [0.2, 0.8, 0.2, 1] })
      animate(y, vec.y, { duration: 0.26, ease: [0.2, 0.8, 0.2, 1] })
      recordVote(current.id, choice)
      setHistory((h) => [...h, current.id])
      window.setTimeout(() => {
        x.set(0)
        y.set(0)
        setLive(null)
        flying.current = false
        setIdx((i) => i + 1)
      }, 270)
    },
    [current, recordVote, x, y],
  )

  const onDrag = useCallback(
    (_: unknown, info: PanInfo) => setLive(choiceFromOffset(info.offset.x, info.offset.y)),
    [choiceFromOffset],
  )
  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const c = choiceFromOffset(info.offset.x, info.offset.y)
      if (c) commit(c)
      else {
        setLive(null)
        animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 })
        animate(y, 0, { type: 'spring', stiffness: 400, damping: 28 })
      }
    },
    [choiceFromOffset, commit, x, y],
  )

  const undo = useCallback(() => {
    if (idx === 0 || history.length === 0) return
    const lastId = history[history.length - 1]
    recordVote(lastId, null)
    setHistory((h) => h.slice(0, -1))
    setIdx((i) => i - 1)
  }, [idx, history, recordVote])

  const restart = useCallback(() => {
    setDeck(pickSession(all))
    setIdx(0)
    setHistory([])
    x.set(0)
    y.set(0)
  }, [all, x, y])

  // Navigation clavier
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done || flying.current) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const map: Record<string, VoteChoice> = {
        ArrowRight: 'pour',
        ArrowLeft: 'contre',
        ArrowUp: 'prioritaire',
        ArrowDown: 'discuter',
        '?': 'incompris',
      }
      const c = map[e.key]
      if (c) {
        e.preventDefault()
        commit(c)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, commit])

  const stack = useMemo(() => deck.slice(idx, idx + 3), [deck, idx])

  if (done) {
    return <SwipeDone count={deck.length} total={votedCount} onAgain={restart} />
  }

  return (
    <div className="mx-auto flex h-[100dvh] max-w-[440px] flex-col" style={{ paddingBottom: 92 }}>
      {/* header */}
      <div className="pad flex items-center justify-between" style={{ paddingTop: 14 }}>
        <div className="flex items-baseline gap-2">
          <span className="eyebrow" style={{ color: '#4C0297' }}>Session de vote</span>
          <span className="display" style={{ fontSize: 20 }}>
            {idx + 1}
            <span className="text-gray" style={{ fontSize: 14 }}>/{deck.length}</span>
          </span>
        </div>
        <button onClick={undo} disabled={idx === 0} className="chip" style={{ opacity: idx === 0 ? 0.4 : 1 }}>
          <Icon n="chevL" s={14} /> Annuler
        </button>
      </div>

      {/* progress */}
      <div className="pad flex gap-[6px]" style={{ margin: '8px 0 6px' }}>
        {deck.map((_, i) => (
          <span
            key={i}
            className="flex-1"
            style={{ height: 5, borderRadius: 9, background: i < idx ? '#4C0297' : i === idx ? '#E5CBFF' : '#D6D5D5' }}
          />
        ))}
      </div>

      {/* card stack */}
      <div className="relative flex-1" style={{ minHeight: 140, margin: '4px 18px 0', perspective: 1000 }}>
        {stack.map((m, k) => {
          if (k === 0) {
            return (
              <motion.div
                key={m.id}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.85}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                style={{ x, y, rotate, touchAction: 'none', zIndex: 10 }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                <SwipeCardFace m={m} live={live} />
              </motion.div>
            )
          }
          return (
            <div
              key={m.id}
              className="absolute inset-0"
              style={{ zIndex: 10 - k, transform: `translateY(${k * 14}px) scale(${1 - k * 0.05})` }}
            >
              <SwipeCardFace m={m} live={null} />
            </div>
          )
        })}
      </div>

      {/* actions */}
      <div style={{ padding: '14px 18px 0' }}>
        <div className="flex items-center justify-between gap-[10px]">
          <ActBtn choice="contre" onClick={() => commit('contre')} big />
          <ActBtn choice="discuter" onClick={() => commit('discuter')} />
          <ActBtn choice="pour" onClick={() => commit('pour')} primary />
          <ActBtn choice="prioritaire" onClick={() => commit('prioritaire')} />
          <ActBtn choice="incompris" onClick={() => commit('incompris')} big />
        </div>
        <p className="text-gray text-center" style={{ fontSize: 11, marginTop: 12 }}>
          Glissez la carte ou utilisez les boutons
        </p>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import Link from 'next/link'
import { useIdentity } from '@/context/IdentityContext'
import { encryptForLocalIdentity, storeEncryptedVote } from '@/lib/identity.client'
import { ActionBar } from './ActionBar'
import type { Measure, VoteChoice } from '@/types'

const ROUND_SIZE = 8
const SWIPE_X = 110
const SWIPE_Y = 95

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Single card ──────────────────────────────────────────────────────────────

interface CardProps {
  measure: Measure
  isTop: boolean
  onVote: (choice: VoteChoice) => Promise<void>
}

function SwipeCard({ measure, isTop, onVote }: CardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const likeOpacity    = useTransform(x, [30, 130], [0, 1])
  const nopeOpacity    = useTransform(x, [-130, -30], [1, 0])
  const prioOpacity    = useTransform(y, [-110, -30], [1, 0])
  const discussOpacity = useTransform(y, [30, 110], [0, 1])

  const [detailOpen, setDetailOpen] = useState(false)

  async function handleDragEnd(_: unknown, info: PanInfo) {
    const ox = info.offset.x
    const oy = info.offset.y
    if (ox > SWIPE_X)        { await onVote('pour') }
    else if (ox < -SWIPE_X)  { await onVote('contre') }
    else if (oy < -SWIPE_Y)  { await onVote('prioritaire') }
    else if (oy > SWIPE_Y)   { await onVote('discuter') }
    else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 })
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 28 })
    }
  }

  const bgStyle = measure.imageUrl
    ? { backgroundImage: `url(${measure.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <>
      <motion.article
        style={{ x, y, rotate, touchAction: 'none', ...bgStyle }}
        drag={isTop}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.85}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing bg-slate-800 shadow-2xl"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20" />

        {/* Decision badges */}
        <motion.div style={{ opacity: likeOpacity }}
          className="absolute top-6 left-5 bg-green-500 text-white font-black text-xl px-4 py-1.5 rounded-xl rotate-[-10deg] border-2 border-green-400 shadow-lg pointer-events-none">
          POUR ♥
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }}
          className="absolute top-6 right-5 bg-red-500 text-white font-black text-xl px-4 py-1.5 rounded-xl rotate-[10deg] border-2 border-red-400 shadow-lg pointer-events-none">
          NOPE ✕
        </motion.div>
        <motion.div style={{ opacity: prioOpacity }}
          className="absolute top-6 left-1/2 -translate-x-1/2 bg-indigo-500 text-white font-black text-lg px-4 py-1.5 rounded-xl border-2 border-indigo-400 shadow-lg pointer-events-none whitespace-nowrap">
          ★ PRIORITÉ
        </motion.div>
        <motion.div style={{ opacity: discussOpacity }}
          className="absolute top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-lg px-4 py-1.5 rounded-xl border-2 border-amber-400 shadow-lg pointer-events-none whitespace-nowrap">
          À DISCUTER
        </motion.div>

        {/* Chapter tag */}
        <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
          <span className="bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1 rounded-full">
            {measure.chapter}
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          <h2 className="text-white font-bold text-xl leading-tight mb-2">{measure.title}</h2>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{measure.summary}</p>
          <button
            type="button"
            className="mt-3 text-white/50 text-sm underline underline-offset-2 pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); setDetailOpen(true) }}
          >
            En savoir plus →
          </button>
        </div>
      </motion.article>

      {/* Detail modal */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">{measure.chapter}</span>
              <button className="text-slate-500 hover:text-white text-xl leading-none" onClick={() => setDetailOpen(false)}>×</button>
            </div>
            <h2 className="text-white font-bold text-lg mb-3">{measure.title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{measure.details || measure.summary}</p>
            {measure.programUrl && (
              <a
                href={measure.programUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-red-400 text-sm underline underline-offset-2"
              >
                Lire dans le programme ↗
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── Deck orchestrator ────────────────────────────────────────────────────────

interface SwipeDeckProps {
  measures: Measure[]
}

export function SwipeDeck({ measures: allMeasures }: SwipeDeckProps) {
  const { identity } = useIdentity()
  const [round, setRound] = useState<Measure[]>(() =>
    shuffle(allMeasures).slice(0, Math.min(ROUND_SIZE, allMeasures.length))
  )
  const [index, setIndex] = useState(0)
  const [history, setHistory] = useState<Array<{ measureId: number; choice: VoteChoice }>>([])
  const [done, setDone] = useState(false)

  const handleVote = useCallback(async (choice: VoteChoice) => {
    const measure = round[index]
    if (!measure) return

    const encryptedVote = identity
      ? await encryptForLocalIdentity(identity, {
          measureId: measure.id,
          choice,
          votedAt: new Date().toISOString(),
        })
      : null

    if (identity && encryptedVote) storeEncryptedVote(identity, measure.id, encryptedVote)

    // Fire-and-forget — don't block the swipe animation
    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: measure.id, choice, voterId: identity?.id, encryptedVote }),
    }).catch(console.error)

    setHistory((h) => [...h.slice(-19), { measureId: measure.id, choice }])

    if (index + 1 >= round.length) {
      setDone(true)
    } else {
      setIndex((v) => v + 1)
    }
  }, [round, index, identity])

  const handleUndo = useCallback(async () => {
    if (history.length === 0 || index === 0) return
    const last = history[history.length - 1]

    fetch('/api/vote/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: last.measureId, choice: last.choice, voterId: identity?.id }),
    }).catch(console.error)

    setHistory((h) => h.slice(0, -1))
    setIndex((v) => v - 1)
  }, [history, index, identity])

  function restart() {
    setRound(shuffle(allMeasures).slice(0, Math.min(ROUND_SIZE, allMeasures.length)))
    setIndex(0)
    setHistory([])
    setDone(false)
  }

  // Round finished
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-6xl mb-5">🎉</div>
        <h2 className="text-white font-bold text-2xl mb-2">Round terminé !</h2>
        <p className="text-slate-400 mb-8">Vous avez évalué {round.length} mesures.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/resultats" className="block bg-red-600 hover:bg-red-500 text-white font-semibold py-4 rounded-2xl text-center transition-colors">
            Voir les résultats →
          </Link>
          <button
            onClick={restart}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            Nouveau round
          </button>
          <Link href="/" className="text-slate-500 text-sm py-2">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  const current = round[index]
  const next    = round[index + 1]

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto px-4 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between py-4 shrink-0">
        <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">
          ← Accueil
        </Link>
        <div className="flex items-center gap-3 flex-1 mx-4">
          <span className="text-slate-500 text-sm shrink-0">{index + 1}/{round.length}</span>
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / round.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Deck area */}
      <div className="relative flex-1 mb-2">
        {/* Ghost card (next) */}
        {next && (
          <div
            className="absolute inset-0 rounded-3xl bg-slate-800 opacity-50"
            style={{
              transform: 'scale(0.94) translateY(8px)',
              backgroundImage: next.imageUrl ? `url(${next.imageUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        {/* Active card */}
        {current && (
          <SwipeCard
            key={current.id}
            measure={current}
            isTop
            onVote={handleVote}
          />
        )}
      </div>

      {/* Hint text */}
      <p className="text-center text-slate-600 text-xs pb-1 shrink-0 select-none">
        Glissez ♥ droite · ✕ gauche · ★ haut · … bas
      </p>

      {/* Action bar */}
      <ActionBar
        onVote={handleVote}
        onUndo={handleUndo}
        canUndo={history.length > 0 && index > 0}
      />
    </div>
  )
}

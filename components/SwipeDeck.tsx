'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useIdentity } from '@/context/IdentityContext'
import { encryptForLocalIdentity, storeEncryptedVote } from '@/lib/identity.client'
import { ActionBar } from './ActionBar'
import { AppHeader } from './AppHeader'
import type { Measure, VoteChoice } from '@/types'

const ROUND_SIZE    = 8
const SWIPE_X       = 110   // px de deplacement pour valider le swipe
const SWIPE_Y       = 95
const FLICK_V       = 500   // px/s de velocite pour valider un swipe rapide

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Carte individuelle ────────────────────────────────────────────────────────

interface CardProps {
  measure: Measure
  isTop: boolean
  onVote: (choice: VoteChoice) => Promise<void>
  onDetailChange: (open: boolean) => void
}

function SwipeCard({ measure, isTop, onVote, onDetailChange }: CardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate      = useTransform(x, [-200, 200], [-18, 18])
  const likeOpacity = useTransform(x, [30, 130], [0, 1])
  const nopeOpacity = useTransform(x, [-130, -30], [1, 0])
  const prioOpacity = useTransform(y, [-110, -30], [1, 0])
  const discOpacity = useTransform(y, [30, 110], [0, 1])

  const [detailOpen, setDetailOpen] = useState(false)

  function openDetail() {
    setDetailOpen(true)
    onDetailChange(true)
  }
  function closeDetail() {
    setDetailOpen(false)
    onDetailChange(false)
  }

  async function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info
    const flickR = velocity.x >  FLICK_V
    const flickL = velocity.x < -FLICK_V
    const flickU = velocity.y < -FLICK_V
    const flickD = velocity.y >  FLICK_V

    if      (offset.x >  SWIPE_X || flickR) await onVote('pour')
    else if (offset.x < -SWIPE_X || flickL) await onVote('contre')
    else if (offset.y < -SWIPE_Y || flickU) await onVote('prioritaire')
    else if (offset.y >  SWIPE_Y || flickD) await onVote('discuter')
    else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 })
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 28 })
    }
  }

  return (
    <>
      <motion.article
        style={{ x, y, rotate, touchAction: 'none' }}
        drag={isTop}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.85}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing bg-surface2 shadow-2xl select-none"
      >
        {/* Image de fond via next/image */}
        {measure.imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={measure.imageUrl}
              alt=""
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover object-center"
              priority={isTop}
              draggable={false}
            />
          </div>
        )}

        {/* Superposition gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

        {/* Badges de decision */}
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
          ★ PRIORITE
        </motion.div>
        <motion.div style={{ opacity: discOpacity }}
          className="absolute top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-lg px-4 py-1.5 rounded-xl border-2 border-amber-400 shadow-lg pointer-events-none whitespace-nowrap">
          A DISCUTER
        </motion.div>

        {/* Etiquette chapitre */}
        <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
          <span className="bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1 rounded-full">
            {measure.chapter}
          </span>
        </div>

        {/* Contenu bas */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          <h2 className="text-white font-bold text-xl leading-tight mb-2">{measure.title}</h2>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{measure.summary}</p>
          <button
            type="button"
            className="mt-3 text-white/50 hover:text-white/80 text-sm underline underline-offset-2 pointer-events-auto transition-colors"
            onClick={e => { e.stopPropagation(); openDetail() }}
          >
            En savoir plus →
          </button>
        </div>
      </motion.article>

      {/* Modal de detail */}
      {detailOpen && (
        <div
          data-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeDetail}
        >
          <div
            className="w-full max-w-md bg-surface border border-line rounded-3xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="bg-surface2 text-muted text-xs px-3 py-1 rounded-full">
                {measure.chapter}
              </span>
              <button
                className="text-faint hover:text-ink text-xl leading-none transition-colors"
                onClick={closeDetail}
              >
                ×
              </button>
            </div>
            <h2 className="text-ink font-bold text-lg mb-3">{measure.title}</h2>
            <p className="text-muted text-sm leading-relaxed">
              {measure.details || measure.summary}
            </p>
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
            {/* Voter depuis la modal */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { onVote('contre'); closeDetail() }}
                className="flex-1 bg-red-950/60 border border-red-800/60 text-red-400 text-sm font-medium py-2.5 rounded-xl transition-colors hover:bg-red-900/60"
              >
                ✕ Contre
              </button>
              <button
                onClick={() => { onVote('discuter'); closeDetail() }}
                className="flex-1 bg-amber-950/60 border border-amber-800/60 text-amber-400 text-sm font-medium py-2.5 rounded-xl transition-colors hover:bg-amber-900/60"
              >
                ... A discuter
              </button>
              <button
                onClick={() => { onVote('pour'); closeDetail() }}
                className="flex-1 bg-green-950/60 border border-green-800/60 text-green-400 text-sm font-medium py-2.5 rounded-xl transition-colors hover:bg-green-900/60"
              >
                ♥ Pour
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Orchestrateur du deck ─────────────────────────────────────────────────────

interface SwipeDeckProps {
  measures: Measure[]
}

export function SwipeDeck({ measures: allMeasures }: SwipeDeckProps) {
  const { identity } = useIdentity()
  const [round, setRound] = useState<Measure[]>(() =>
    shuffle(allMeasures).slice(0, Math.min(ROUND_SIZE, allMeasures.length))
  )
  const [index,   setIndex]   = useState(0)
  const [history, setHistory] = useState<Array<{ measureId: number; choice: VoteChoice }>>([])
  const [done,    setDone]    = useState(false)
  const isDetailOpen = useRef(false)

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

    // Fire-and-forget — ne bloque pas l'animation
    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: measure.id, choice, voterId: identity?.id, encryptedVote }),
    }).catch(console.error)

    setHistory(h => [...h.slice(-19), { measureId: measure.id, choice }])
    if (index + 1 >= round.length) setDone(true)
    else setIndex(v => v + 1)
  }, [round, index, identity])

  const handleUndo = useCallback(async () => {
    if (history.length === 0 || index === 0) return
    const last = history[history.length - 1]
    fetch('/api/vote/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: last.measureId, choice: last.choice, voterId: identity?.id }),
    }).catch(console.error)
    setHistory(h => h.slice(0, -1))
    setIndex(v => v - 1)
  }, [history, index, identity])

  // Navigation clavier (fleches)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return
      if (isDetailOpen.current) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); handleVote('pour');        break
        case 'ArrowLeft':  e.preventDefault(); handleVote('contre');      break
        case 'ArrowUp':    e.preventDefault(); handleVote('prioritaire'); break
        case 'ArrowDown':  e.preventDefault(); handleVote('discuter');    break
        case '?':          e.preventDefault(); handleVote('incompris');   break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, handleVote])

  function restart() {
    setRound(shuffle(allMeasures).slice(0, Math.min(ROUND_SIZE, allMeasures.length)))
    setIndex(0)
    setHistory([])
    setDone(false)
  }

  // Ecran de fin de round
  if (done) {
    return (
      <div className="flex flex-col h-[100dvh] max-w-md mx-auto">
        <AppHeader backHref="/" backLabel="Accueil" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-6xl mb-5">🎉</div>
          <h2 className="text-ink font-bold text-2xl mb-2">Round termine !</h2>
          <p className="text-muted mb-8">
            Vous avez evalue {round.length} mesures.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link
              href="/resultats"
              className="bg-red-600 hover:bg-red-500 text-white font-semibold py-4 rounded-2xl text-center transition-colors"
            >
              Voir les resultats →
            </Link>
            <button
              onClick={restart}
              className="bg-surface2 hover:bg-surface3 text-ink font-semibold py-4 rounded-2xl transition-colors"
            >
              Nouveau round
            </button>
            <Link href="/" className="text-faint text-sm py-2 transition-colors hover:text-muted">
              ← Retour a l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const current = round[index]
  const next    = round[index + 1]

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto">
      <AppHeader backHref="/" backLabel="Accueil" />

      {/* Barre de progression */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0">
        <span className="text-faint text-sm tabular-nums shrink-0">{index + 1}/{round.length}</span>
        <div className="flex-1 h-1 bg-surface2 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / round.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Zone du deck */}
      <div className="relative flex-1 px-4 mb-1">
        {/* Carte fantome (suivante) */}
        {next && (
          <div
            className="absolute inset-4 rounded-3xl bg-surface2 overflow-hidden"
            style={{ transform: 'scale(0.94) translateY(8px)', opacity: 0.5 }}
          >
            {next.imageUrl && (
              <Image src={next.imageUrl} alt="" fill sizes="448px" className="object-cover" />
            )}
          </div>
        )}
        {/* Carte active */}
        {current && (
          <SwipeCard
            key={current.id}
            measure={current}
            isTop
            onVote={handleVote}
            onDetailChange={open => { isDetailOpen.current = open }}
          />
        )}
      </div>

      {/* Indice clavier (desktop uniquement) */}
      <p className="text-center text-faint text-xs pb-1 shrink-0 select-none hidden sm:block">
        ← Contre  &nbsp;|&nbsp; → Pour  &nbsp;|&nbsp; ↑ Prioritaire  &nbsp;|&nbsp; ↓ A discuter
      </p>

      {/* Barre d'actions */}
      <ActionBar
        onVote={handleVote}
        onUndo={handleUndo}
        canUndo={history.length > 0 && index > 0}
      />
    </div>
  )
}

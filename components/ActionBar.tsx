'use client'

import type { VoteChoice } from '@/types'

interface ActionBarProps {
  onVote: (choice: VoteChoice) => void
  onUndo: () => void
  canUndo: boolean
}

const BTN_BASE = 'flex items-center justify-center rounded-full transition-all active:scale-90 select-none'

export function ActionBar({ onVote, onUndo, canUndo }: ActionBarProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-5 safe-bottom">
      {/* Undo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Annuler le dernier vote"
        className={`${BTN_BASE} w-11 h-11 bg-surface2 hover:bg-surface3 disabled:opacity-25 disabled:cursor-not-allowed text-muted text-base`}
      >
        ↩
      </button>

      {/* Contre */}
      <button
        onClick={() => onVote('contre')}
        aria-label="Contre"
        className={`${BTN_BASE} w-16 h-16 bg-red-950/60 hover:bg-red-900/60 border-2 border-red-600 text-red-400 text-2xl`}
      >
        ✕
      </button>

      {/* Incompris */}
      <button
        onClick={() => onVote('incompris')}
        aria-label="Pas clair"
        className={`${BTN_BASE} w-11 h-11 bg-surface2 hover:bg-surface3 text-muted text-base font-bold`}
      >
        ?
      </button>

      {/* Pour */}
      <button
        onClick={() => onVote('pour')}
        aria-label="Pour"
        className={`${BTN_BASE} w-16 h-16 bg-green-950/60 hover:bg-green-900/60 border-2 border-green-600 text-green-400 text-2xl`}
      >
        ♥
      </button>

      {/* Prioritaire */}
      <button
        onClick={() => onVote('prioritaire')}
        aria-label="Prioritaire"
        className={`${BTN_BASE} w-11 h-11 bg-indigo-800 hover:bg-indigo-700 text-white text-base`}
      >
        ★
      </button>
    </div>
  )
}

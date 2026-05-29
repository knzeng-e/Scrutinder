'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ProgramChapter } from '@/types'

const PART_COLORS: Record<string, string> = {
  'Préambule':                              'from-slate-800 to-slate-900',
  'Faire la révolution citoyenne':          'from-red-950 to-slate-900',
  'L\'harmonie des êtres humains entre eux': 'from-indigo-950 to-slate-900',
  'L\'harmonie des êtres humains avec la nature': 'from-emerald-950 to-slate-900',
  'Ordonner le monde':                      'from-sky-950 to-slate-900',
}

function partColor(part: string): string {
  return PART_COLORS[part] ?? 'from-slate-800 to-slate-900'
}

// ── Chapter detail ────────────────────────────────────────────────────────────

function ChapterDetail({ chapter, onBack }: { chapter: ProgramChapter; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 safe-top">
      <button onClick={onBack} className="text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        ← Retour
      </button>

      <div className={`rounded-3xl bg-gradient-to-br ${partColor(chapter.part)} p-6 mb-6 border border-white/5`}>
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{chapter.part}</span>
        <h2 className="text-white font-bold text-2xl mt-2 leading-tight">{chapter.title}</h2>
        <p className="text-white/70 text-sm mt-3 leading-relaxed">{chapter.summary}</p>
      </div>

      <div className="space-y-4">
        {chapter.content.map((block, i) => {
          if (block.type === 'h2') return <h3 key={i} className="text-white font-bold text-xl mt-6">{block.text}</h3>
          if (block.type === 'h3') return <h4 key={i} className="text-slate-200 font-semibold text-base mt-4">{block.text}</h4>
          return <p key={i} className="text-slate-400 text-sm leading-relaxed">{block.text}</p>
        })}
      </div>

      {chapter.url && (
        <a
          href={chapter.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 text-red-400 text-sm underline underline-offset-2"
        >
          Lire la version complète ↗
        </a>
      )}
    </div>
  )
}

// ── Reader index ──────────────────────────────────────────────────────────────

interface ProgramReaderProps {
  program: ProgramChapter[]
}

export function ProgramReader({ program }: ProgramReaderProps) {
  const [selected, setSelected] = useState<ProgramChapter | null>(null)

  if (selected) {
    return <ChapterDetail chapter={selected} onBack={() => setSelected(null)} />
  }

  const parts = [...new Set(program.map((c) => c.part))]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition-colors block mb-2">← Accueil</Link>
          <h1 className="text-white font-bold text-2xl">L&apos;Avenir en Commun</h1>
          <p className="text-slate-400 text-sm mt-1">{program.length} chapitres · programme 2025</p>
        </div>
      </div>

      {/* Parts */}
      {parts.map((part) => {
        const chapters = program.filter((c) => c.part === part)
        return (
          <div key={part} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">{part}</h2>
              <span className="text-slate-600 text-xs">{chapters.length} chapitres</span>
            </div>
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setSelected(chapter)}
                  className={`w-full text-left bg-gradient-to-r ${partColor(chapter.part)} border border-white/5 rounded-2xl px-5 py-4 hover:border-white/20 transition-all group`}
                >
                  <div className="text-white font-semibold text-sm group-hover:text-white/90">{chapter.title}</div>
                  <div className="text-white/50 text-xs mt-1 line-clamp-2">{chapter.summary}</div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

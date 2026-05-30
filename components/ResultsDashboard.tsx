'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppHeader } from './AppHeader'
import type { Measure, ResultsData, VoteCounts, VoteChoice } from '@/types'

const CHOICES = [
  { key: 'pour'        as VoteChoice, icon: '♥', label: 'Pour',        color: '#22c55e' },
  { key: 'contre'      as VoteChoice, icon: '✕', label: 'Contre',      color: '#ef4444' },
  { key: 'prioritaire' as VoteChoice, icon: '★', label: 'Prioritaire', color: '#6366f1' },
  { key: 'discuter'    as VoteChoice, icon: '…', label: 'A discuter',  color: '#f59e0b' },
  { key: 'incompris'   as VoteChoice, icon: '?', label: 'Pas clair',   color: '#94a3b8' },
]

type SortKey = VoteChoice | 'total'

interface EnrichedMeasure extends Measure, VoteCounts { total: number }

function enrich(measures: Measure[], votes: Record<number, VoteCounts>): EnrichedMeasure[] {
  return measures.map(m => {
    const v = votes[m.id] ?? { pour: 0, contre: 0, discuter: 0, prioritaire: 0, incompris: 0 }
    const total = v.pour + v.contre + v.discuter + v.prioritaire + v.incompris
    return { ...m, ...v, total }
  })
}

function pct(n: number, total: number) {
  return total === 0 ? '0' : ((n / total) * 100).toFixed(1)
}

// ── Carte de statistique ──────────────────────────────────────────────────────

function StatCard({ icon, label, value, percentage, color }: {
  icon: string; label: string; value: number; percentage: string; color: string
}) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-2xl" style={{ color }}>{icon}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-ink font-bold text-xl">{value}</span>
        <span className="text-faint text-sm">{percentage}%</span>
      </div>
      <span className="text-muted text-xs">{label}</span>
    </div>
  )
}

// ── Barre empilee ─────────────────────────────────────────────────────────────

function StackedBar({ global }: { global: EnrichedMeasure }) {
  if (global.total === 0) return null
  return (
    <div className="mb-6">
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {CHOICES.map(({ key, color }) => {
          const w = (global[key] / global.total) * 100
          if (w < 0.5) return null
          return (
            <div
              key={key}
              style={{ width: `${w}%`, background: color }}
              title={`${key}: ${w.toFixed(1)}%`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {CHOICES.map(({ key, icon, label, color }) => (
          <span key={key} className="flex items-center gap-1 text-xs text-muted">
            <span style={{ color }}>{icon}</span>
            {label} · {pct(global[key], global.total)}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Tableau des resultats ─────────────────────────────────────────────────────

function ResultsTable({ rows, sortBy, sortDir, onSort }: {
  rows: EnrichedMeasure[]
  sortBy: SortKey
  sortDir: 'asc' | 'desc'
  onSort: (k: SortKey) => void
}) {
  const cols: Array<{ key: SortKey; label: string; color?: string }> = [
    { key: 'total',       label: 'Total' },
    { key: 'pour',        label: '♥',  color: '#22c55e' },
    { key: 'contre',      label: '✕',  color: '#ef4444' },
    { key: 'prioritaire', label: '★',  color: '#6366f1' },
    { key: 'discuter',    label: '…',  color: '#f59e0b' },
    { key: 'incompris',   label: '?',  color: '#94a3b8' },
  ]

  return (
    <div className="overflow-x-auto -mx-4">
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="border-b border-line">
            <th className="text-left text-faint font-medium py-2 px-4">Mesure</th>
            {cols.map(({ key, label, color }) => (
              <th
                key={key}
                onClick={() => onSort(key)}
                className={`text-right py-2 px-2 cursor-pointer select-none font-medium transition-colors ${
                  sortBy === key ? 'text-ink' : 'text-faint hover:text-muted'
                }`}
                style={sortBy === key && color ? { color } : {}}
              >
                {label}
                {sortBy === key ? (sortDir === 'desc' ? '↓' : '↑') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((m, i) => (
            <tr key={m.id} className="border-b border-line hover:bg-surface/50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-faint text-xs w-5 shrink-0 text-right">{i + 1}</span>
                  <span className="text-ink text-sm leading-tight">{m.title}</span>
                </div>
              </td>
              {cols.map(({ key, color }) => (
                <td key={key} className="text-right py-3 px-2">
                  <span
                    className={sortBy === key ? 'font-semibold' : 'text-faint'}
                    style={sortBy === key ? { color: color ?? 'rgb(var(--ink))' } : {}}
                  >
                    {m[key]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Tableau de bord ───────────────────────────────────────────────────────────

interface ResultsDashboardProps {
  measures: Measure[]
  results: ResultsData
}

export function ResultsDashboard({ measures, results }: ResultsDashboardProps) {
  const [sortBy,  setSortBy]  = useState<SortKey>('total')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showAll, setShowAll] = useState(false)
  const TOP_N = 10

  const enriched = enrich(measures, results.votes)

  const global = enriched.reduce<EnrichedMeasure>(
    (acc, m) => ({
      ...acc,
      pour:        acc.pour        + m.pour,
      contre:      acc.contre      + m.contre,
      discuter:    acc.discuter    + m.discuter,
      prioritaire: acc.prioritaire + m.prioritaire,
      incompris:   acc.incompris   + m.incompris,
      total:       acc.total       + m.total,
    }),
    { id: 0, title: '', summary: '', chapter: '', pour: 0, contre: 0, discuter: 0, prioritaire: 0, incompris: 0, total: 0 }
  )

  const sorted = [...enriched].sort((a, b) =>
    sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]
  )
  const displayed = showAll ? sorted : sorted.slice(0, TOP_N)

  function toggleSort(col: SortKey) {
    if (sortBy === col) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortBy(col); setSortDir('desc') }
  }

  const highlights = {
    priority: enriched.filter(m => m.prioritaire > 0).sort((a, b) => b.prioritaire - a.prioritaire)[0],
    debated:  enriched.filter(m => m.discuter > 0).sort((a, b) => b.discuter - a.discuter)[0],
  }

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-2xl mx-auto">
      <AppHeader showBrand />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* En-tete */}
        <div className="mb-6">
          <h1 className="text-ink font-bold text-2xl">Resultats agreges</h1>
          <p className="text-muted text-sm mt-1">
            {global.total} vote{global.total !== 1 ? 's' : ''} · {measures.length} mesures
          </p>
        </div>

        {/* Grille de statistiques */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {CHOICES.slice(0, 3).map(({ key, icon, label, color }) => (
            <StatCard
              key={key}
              icon={icon}
              label={label}
              value={global[key]}
              percentage={pct(global[key], global.total)}
              color={color}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {CHOICES.slice(3).map(({ key, icon, label, color }) => (
            <StatCard
              key={key}
              icon={icon}
              label={label}
              value={global[key]}
              percentage={pct(global[key], global.total)}
              color={color}
            />
          ))}
        </div>

        {/* Barre empilee */}
        <StackedBar global={global} />

        {/* Faits saillants */}
        {(highlights.priority || highlights.debated) && (
          <div className="space-y-2 mb-6">
            {highlights.priority && (
              <div className="bg-indigo-950/50 border border-indigo-800/50 rounded-2xl px-4 py-3 flex gap-3 items-start">
                <span className="text-indigo-400 text-xl shrink-0">★</span>
                <div>
                  <div className="text-muted text-xs">Priorite n°1</div>
                  <div className="text-ink text-sm font-medium">{highlights.priority.title}</div>
                </div>
              </div>
            )}
            {highlights.debated && (
              <div className="bg-amber-950/50 border border-amber-800/50 rounded-2xl px-4 py-3 flex gap-3 items-start">
                <span className="text-amber-400 text-xl shrink-0">…</span>
                <div>
                  <div className="text-muted text-xs">La plus debattue</div>
                  <div className="text-ink text-sm font-medium">{highlights.debated.title}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tableau */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-ink font-semibold text-sm">
              {showAll
                ? `Toutes les mesures (${sorted.length})`
                : `Top ${Math.min(TOP_N, sorted.length)}`}
            </h2>
            <span className="text-faint text-xs">Cliquez une colonne pour trier</span>
          </div>
          <ResultsTable rows={displayed} sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
          {!showAll && sorted.length > TOP_N && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-4 w-full text-faint hover:text-ink text-sm py-2 transition-colors"
            >
              Voir les {sorted.length - TOP_N} autres mesures →
            </button>
          )}
          {showAll && (
            <button
              onClick={() => setShowAll(false)}
              className="mt-4 w-full text-faint hover:text-ink text-sm py-2 transition-colors"
            >
              Reduire ↑
            </button>
          )}
        </div>

        {/* Hash d'integrite */}
        <div className="bg-surface border border-line rounded-2xl px-4 py-4 mt-6">
          <div className="text-muted text-xs font-medium mb-1">
            Hash de verification (SHA-256)
          </div>
          <div className="font-mono text-xs text-faint break-all">{results.hash}</div>
          <div className="text-faint text-xs mt-2">
            Ce hash permet de verifier publiquement l&apos;integrite des resultats.
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pb-8">
          <Link
            href="/swipe"
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-2xl text-center text-sm transition-colors"
          >
            Nouveau round
          </Link>
          <Link
            href="/"
            className="flex-1 bg-surface2 hover:bg-surface3 text-ink font-semibold py-3 rounded-2xl text-center text-sm transition-colors"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

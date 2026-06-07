'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { Contribution } from '@/types'

interface AdminData {
  totalVotes: number
  totalComments: number
  totalContributions: number
  debated: Array<{ measureId: number; title: string; discuter: number }>
  recentContributions: Contribution[]
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [data, setData] = useState<AdminData | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { Authorization: `Bearer ${password}` },
      })
      if (res.status === 401) {
        setError('Mot de passe incorrect (ou ADMIN_PASSWORD non configuré).')
        return
      }
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError('Erreur de chargement.')
    } finally {
      setBusy(false)
    }
  }

  // ── Écran de connexion ──────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <form onSubmit={login} className="w-full max-w-sm">
          <h1 className="text-ink font-bold text-2xl mb-1">Administration</h1>
          <p className="text-muted text-sm mb-6">Tableau de bord Scrutinder</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe admin"
            className="w-full bg-surface2 border border-line focus:border-red-500 text-ink rounded-xl px-4 py-3 text-sm outline-none transition-colors mb-3"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <Button type="submit" loading={busy} className="w-full">
            Se connecter
          </Button>
          <Link href="/" className="block text-center text-faint hover:text-muted text-sm mt-4 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </form>
      </div>
    )
  }

  // ── Tableau de bord ───────────────────────────────────────────────────────────
  const maxDebated = Math.max(...data.debated.map((d) => d.discuter), 1)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-ink font-bold text-2xl">Administration</h1>
        <a
          href={`/api/admin/export?key=${encodeURIComponent(password)}`}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          Export CSV ↓
        </a>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {[
          { label: 'Votes', value: data.totalVotes },
          { label: 'Messages', value: data.totalComments },
          { label: 'Idées', value: data.totalContributions },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-line rounded-2xl p-4">
            <div className="text-ink font-bold text-2xl">{s.value}</div>
            <div className="text-muted text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mesures les plus débattues */}
      <section className="mb-8">
        <h2 className="text-ink font-semibold text-sm mb-3">Mesures les plus débattues (« À discuter »)</h2>
        {data.debated.length === 0 ? (
          <p className="text-faint text-sm">Aucun vote « à discuter » pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-2">
            {data.debated.map((d, i) => (
              <li key={d.measureId} className="bg-surface border border-line rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <Link
                    href={`/mesures/${d.measureId}`}
                    className="text-ink text-sm leading-tight hover:text-red-400 transition-colors flex-1 min-w-0"
                  >
                    <span className="text-faint mr-2">{i + 1}.</span>
                    {d.title}
                  </Link>
                  <span className="text-amber-400 text-sm font-semibold shrink-0">{d.discuter}</span>
                </div>
                <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(d.discuter / maxDebated) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Contributions récentes */}
      <section>
        <h2 className="text-ink font-semibold text-sm mb-3">Idées récentes</h2>
        {data.recentContributions.length === 0 ? (
          <p className="text-faint text-sm">Aucune idée soumise pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-2">
            {data.recentContributions.map((c) => (
              <li key={c.id} className="bg-surface border border-line rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-ink text-sm font-semibold">{c.pseudonym}</span>
                  {c.measureId && (
                    <Link href={`/mesures/${c.measureId}`} className="text-faint text-xs hover:text-red-400">
                      mesure #{c.measureId}
                    </Link>
                  )}
                </div>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap break-words">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

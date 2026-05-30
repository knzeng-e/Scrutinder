'use client'

import { useEffect, useState } from 'react'
import { useIdentity } from '@/context/IdentityContext'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/components/ui/Toast'
import {
  getEncryptedVotesForIdentity,
  decryptForLocalIdentity,
} from '@/lib/identity.client'
import { getMeasureById } from '@/lib/measures'
import type { VotePayload } from '@/types'

interface Props {
  onClose: () => void
}

const LABELS: Record<string, string> = {
  pour:        'Pour ♥',
  contre:      'Contre ✕',
  prioritaire: 'Prioritaire ★',
  discuter:    'A discuter ...',
  incompris:   'Pas clair ?',
}

const COLORS: Record<string, string> = {
  pour:        'text-green-400',
  contre:      'text-red-400',
  prioritaire: 'text-indigo-400',
  discuter:    'text-amber-400',
  incompris:   'text-faint',
}

export function AccountPanel({ onClose }: Props) {
  const { identity, savePseudonym, logout, deleteProfile } = useIdentity()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [draft, setDraft] = useState(identity?.pseudonym ?? '')
  const [votes, setVotes] = useState<VotePayload[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!identity) return
    const envelopes = getEncryptedVotesForIdentity(identity)
    Promise.all(
      envelopes.map(({ envelope }) =>
        decryptForLocalIdentity(identity, envelope).catch(() => null)
      )
    ).then(results => {
      const valid = results.filter((v): v is VotePayload => v !== null)
      valid.sort((a, b) => b.votedAt.localeCompare(a.votedAt))
      setVotes(valid)
      setLoading(false)
    })
  }, [identity])

  function handleSave() {
    savePseudonym(draft)
    toast('Pseudonyme enregistré', 'success')
  }

  function handleDelete() {
    if (
      !window.confirm(
        'Supprimer ce profil, le passkey et tous les votes enregistres sur cet appareil ?'
      )
    )
      return
    deleteProfile()
    onClose()
  }

  if (!identity) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface border border-line rounded-3xl overflow-hidden max-h-[88vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* En-tete */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-line shrink-0">
          <h2 className="text-ink font-bold text-lg">Mon compte</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-full text-faint hover:text-ink hover:bg-surface2 transition-colors text-xl leading-none"
          >
            x
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Pseudonyme */}
          <section>
            <p className="text-faint text-xs font-semibold uppercase tracking-wider mb-2">
              Pseudonyme
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                maxLength={32}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="flex-1 bg-surface2 border border-line focus:border-red-500 text-ink rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              />
              <button
                onClick={handleSave}
                className="text-sm px-4 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap bg-surface3 hover:bg-surface2 text-ink"
              >
                Sauvegarder
              </button>
            </div>
          </section>

          {/* ID cryptographique */}
          <section>
            <p className="text-faint text-xs font-semibold uppercase tracking-wider mb-2">
              Identifiant cryptographique
            </p>
            <p className="font-mono text-xs text-faint break-all bg-surface2 rounded-xl px-4 py-3 leading-relaxed">
              {identity.id}
            </p>
            <p className="text-faint text-xs mt-1.5">
              Votre identite est locale - aucun serveur ne peut vous identifier.
            </p>
          </section>

          {/* Apparence */}
          <section>
            <p className="text-faint text-xs font-semibold uppercase tracking-wider mb-2">
              Apparence
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  theme === 'dark'
                    ? 'bg-surface2 border-red-500 text-ink'
                    : 'bg-surface2 border-line text-muted hover:text-ink'
                }`}
              >
                🌙 Sombre
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  theme === 'light'
                    ? 'bg-surface2 border-red-500 text-ink'
                    : 'bg-surface2 border-line text-muted hover:text-ink'
                }`}
              >
                ☀️ Clair
              </button>
            </div>
          </section>

          {/* Historique des votes */}
          <section>
            <p className="text-faint text-xs font-semibold uppercase tracking-wider mb-3">
              Votes enregistres sur cet appareil
              {votes.length > 0 && (
                <span className="ml-1 text-faint normal-case">({votes.length})</span>
              )}
            </p>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-surface2 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : votes.length === 0 ? (
              <p className="text-faint text-sm py-2">
                Aucun vote enregistre sur cet appareil.
              </p>
            ) : (
              <ul className="space-y-2">
                {votes.map((v, i) => {
                  const measure = getMeasureById(v.measureId)
                  return (
                    <li
                      key={i}
                      className="bg-surface2 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <span className="text-muted text-sm leading-tight line-clamp-1 flex-1 min-w-0">
                        {measure?.title ?? `Mesure #${v.measureId}`}
                      </span>
                      <span
                        className={`text-sm font-medium shrink-0 ${COLORS[v.choice] ?? 'text-muted'}`}
                      >
                        {LABELS[v.choice] ?? v.choice}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-line space-y-2 shrink-0 safe-bottom">
          <button
            onClick={() => {
              logout()
              onClose()
            }}
            className="w-full bg-surface2 hover:bg-surface3 text-ink text-sm font-medium py-3 rounded-2xl transition-colors"
          >
            Verrouiller le compte
          </button>
          <button
            onClick={handleDelete}
            className="w-full bg-red-950/40 hover:bg-red-950/80 border border-red-800/40 text-red-400 text-sm font-medium py-3 rounded-2xl transition-colors"
          >
            Supprimer ce profil local
          </button>
        </div>
      </div>
    </div>
  )
}

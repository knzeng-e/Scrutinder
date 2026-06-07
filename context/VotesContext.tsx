'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useIdentity } from '@/context/IdentityContext'
import {
  encryptForLocalIdentity,
  storeEncryptedVote,
  getEncryptedVotesForIdentity,
  decryptForLocalIdentity,
} from '@/lib/identity.client'
import type { Identity, VoteChoice } from '@/types'

interface VotesContextValue {
  votes: Record<number, VoteChoice>
  votedCount: number
  ready: boolean
  lastVote: number | null
  /** Enregistre (ou annule si `choice === null`) un vote pour une mesure. */
  recordVote: (measureId: number, choice: VoteChoice | null) => void
  /** Annule le dernier vote enregistré. */
  undo: () => void
}

const VotesContext = createContext<VotesContextValue | null>(null)

const VOTE_KEY_PREFIX = 'scrutinder.vote-key.'

function removeLocalVote(identity: Identity, measureId: number) {
  if (typeof window === 'undefined' || !identity?.id) return
  localStorage.removeItem(`${VOTE_KEY_PREFIX}${identity.id}.${measureId}`)
}

export function VotesProvider({ children }: { children: React.ReactNode }) {
  const { identity, status } = useIdentity()
  const [votes, setVotes] = useState<Record<number, VoteChoice>>({})
  const [ready, setReady] = useState(false)
  const [lastVote, setLastVote] = useState<number | null>(null)
  const loadedFor = useRef<string | null>(null)

  // Charge et déchiffre les votes locaux quand l'identité est prête.
  useEffect(() => {
    if (status !== 'ready' || !identity) {
      // Onboarding ou mode invité (sans identité locale) : pas de votes à charger.
      if (status === 'onboarding' || status === 'ready') setReady(true)
      return
    }
    if (loadedFor.current === identity.id) return
    loadedFor.current = identity.id
    let active = true
    const envelopes = getEncryptedVotesForIdentity(identity)
    Promise.all(
      envelopes.map(({ measureId, envelope }) =>
        decryptForLocalIdentity(identity, envelope)
          .then((p) => ({ measureId, choice: p.choice }))
          .catch(() => null),
      ),
    ).then((rows) => {
      if (!active) return
      const map: Record<number, VoteChoice> = {}
      for (const r of rows) if (r) map[r.measureId] = r.choice
      setVotes(map)
      setReady(true)
    })
    return () => {
      active = false
    }
  }, [identity, status])

  const recordVote = useCallback(
    (measureId: number, choice: VoteChoice | null) => {
      // Annulation (toggle off)
      if (choice === null) {
        const prev = votes[measureId]
        setVotes((v) => {
          const n = { ...v }
          delete n[measureId]
          return n
        })
        if (identity) removeLocalVote(identity, measureId)
        if (lastVote === measureId) setLastVote(null)
        if (prev) {
          fetch('/api/vote/undo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: measureId, choice: prev, voterId: identity?.id }),
          }).catch(() => {})
        }
        return
      }

      // Enregistrement / remplacement
      setVotes((v) => ({ ...v, [measureId]: choice }))
      setLastVote(measureId)
      const persist = async () => {
        let encryptedVote = null
        if (identity) {
          try {
            encryptedVote = await encryptForLocalIdentity(identity, {
              measureId,
              choice,
              votedAt: new Date().toISOString(),
            })
            storeEncryptedVote(identity, measureId, encryptedVote)
          } catch {
            /* chiffrement indisponible — on poste quand même le comptage */
          }
        }
        fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: measureId, choice, voterId: identity?.id, encryptedVote }),
        }).catch(() => {})
      }
      persist()
    },
    [votes, identity, lastVote],
  )

  const undo = useCallback(() => {
    if (lastVote != null) recordVote(lastVote, null)
  }, [lastVote, recordVote])

  return (
    <VotesContext.Provider
      value={{ votes, votedCount: Object.keys(votes).length, ready, lastVote, recordVote, undo }}
    >
      {children}
    </VotesContext.Provider>
  )
}

export function useVotes(): VotesContextValue {
  const ctx = useContext(VotesContext)
  if (!ctx) throw new Error('useVotes doit être utilisé dans <VotesProvider>')
  return ctx
}

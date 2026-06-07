'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthStatus, Identity } from '@/types'
import {
  createIdentityWithPasskey,
  authenticateIdentity,
  deleteLocalProfile,
  getStoredIdentity,
  isWebAuthnSupported,
  resetStaleLocalState,
  updateLocalPseudonym,
} from '@/lib/identity.client'

interface IdentityContextValue {
  identity: Identity | null
  status: AuthStatus
  error: string
  isBusy: boolean
  isSupported: boolean
  /** vrai quand le passkey local n'a pas de credential côté serveur (base réinitialisée / nouvel appareil) */
  needsRecovery: boolean
  createAccount: (pseudonym: string) => Promise<void>
  unlock: () => Promise<void>
  /** ré-enregistre un passkey pour l'identité locale existante (réutilise la graine) */
  recreatePasskey: () => Promise<void>
  /** vrai quand l'utilisateur explore sans identité locale */
  guest: boolean
  /** entre dans l'app sans créer d'identité (votes anonymes) */
  continueAsGuest: () => void
  savePseudonym: (pseudonym: string) => void
  logout: () => void
  deleteProfile: () => void
  clearError: () => void
}

const GUEST_KEY = 'scrutinder.guest'

const IdentityContext = createContext<IdentityContextValue | null>(null)

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [needsRecovery, setNeedsRecovery] = useState(false)
  const [guest, setGuest] = useState(false)
  const isSupported = isWebAuthnSupported()

  useEffect(() => {
    // Purge ponctuelle du stockage local (voir STATE_VERSION) avant toute lecture.
    resetStaleLocalState()
    const stored = getStoredIdentity()
    if (!stored) {
      if (typeof window !== 'undefined' && localStorage.getItem(GUEST_KEY)) {
        setGuest(true)
        setStatus('ready')
      } else {
        setStatus('onboarding')
      }
      return
    }
    setIdentity(stored)
    setStatus(stored.passkey?.credentialId ? 'locked' : 'onboarding')
  }, [])

  const continueAsGuest = useCallback(() => {
    try { localStorage.setItem(GUEST_KEY, '1') } catch { /* ignore */ }
    setGuest(true)
    setStatus('ready')
  }, [])

  const createAccount = useCallback(async (pseudonym: string) => {
    setIsBusy(true)
    setError('')
    try {
      const created = await createIdentityWithPasskey(identity, pseudonym)
      try { localStorage.removeItem(GUEST_KEY) } catch { /* ignore */ }
      setGuest(false)
      setIdentity(created)
      setStatus('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Création du compte impossible.')
    } finally {
      setIsBusy(false)
    }
  }, [identity])

  const unlock = useCallback(async () => {
    if (!identity) return
    setIsBusy(true)
    setError('')
    try {
      const unlocked = await authenticateIdentity(identity)
      setIdentity(unlocked)
      setStatus('ready')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Déverrouillage impossible.'
      if (msg === 'NO_SERVER_CREDENTIAL') {
        setNeedsRecovery(true)
        setError('Ce passkey n’est plus reconnu par le serveur (base réinitialisée ou nouvel appareil). Recréez votre passkey pour retrouver l’accès.')
      } else {
        setError(msg)
      }
    } finally {
      setIsBusy(false)
    }
  }, [identity])

  // Récupération : ré-enregistre un passkey pour l'identité locale existante.
  // La graine (et donc l'historique de votes chiffré) est préservée.
  const recreatePasskey = useCallback(async () => {
    if (!identity) return
    setIsBusy(true)
    setError('')
    try {
      const recreated = await createIdentityWithPasskey(identity, identity.pseudonym)
      setIdentity(recreated)
      setNeedsRecovery(false)
      setStatus('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recréation du passkey impossible.')
    } finally {
      setIsBusy(false)
    }
  }, [identity])

  const savePseudonym = useCallback((pseudonym: string) => {
    if (!identity) return
    setIdentity(updateLocalPseudonym(identity, pseudonym))
  }, [identity])

  const logout = useCallback(() => {
    setStatus('locked')
  }, [])

  const deleteProfile = useCallback(() => {
    if (!identity) return
    deleteLocalProfile(identity)
    setIdentity(null)
    setStatus('onboarding')
  }, [identity])

  const clearError = useCallback(() => { setError(''); setNeedsRecovery(false) }, [])

  return (
    <IdentityContext.Provider
      value={{ identity, status, error, isBusy, isSupported, needsRecovery, guest, continueAsGuest, createAccount, unlock, recreatePasskey, savePseudonym, logout, deleteProfile, clearError }}
    >
      {children}
    </IdentityContext.Provider>
  )
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within <IdentityProvider>')
  return ctx
}

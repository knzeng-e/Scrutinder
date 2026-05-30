'use client'

import { useState } from 'react'
import { useIdentity } from '@/context/IdentityContext'

export function IdentityGate() {
  const { status, error, isBusy, isSupported, needsRecovery, createAccount, unlock, recreatePasskey, clearError } = useIdentity()
  const [pseudonym, setPseudonym] = useState('')
  const isLocked = status === 'locked'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            <span className="text-red-500">Scru</span>tinder
          </h1>
          <p className="text-slate-400 text-sm">
            Swipez le programme · Mesurez l&apos;adhésion
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
          {/* Icon + title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              {isLocked ? '🔒' : '✦'}
            </div>
            <h2 className="text-white font-bold text-lg">
              {isLocked ? 'Déverrouiller votre espace' : 'Créer votre espace'}
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
              {isLocked
                ? 'Utilisez votre passkey pour accéder à vos votes.'
                : 'Sans e-mail, sans identité civile. Votre appareil fait tout.'}
            </p>
          </div>

          {/* Pseudonym field (only on creation) */}
          {!isLocked && (
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Pseudonyme <span className="text-slate-500 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={pseudonym}
                maxLength={32}
                placeholder="Ex. LumièrePopulaire"
                onChange={(e) => { setPseudonym(e.target.value); clearError() }}
                className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>
          )}

          {/* WebAuthn not supported warning */}
          {!isSupported && (
            <div className="bg-amber-950/60 border border-amber-700/60 rounded-xl px-4 py-3 mb-4">
              <p className="text-amber-300 text-sm">
                Les passkeys nécessitent HTTPS ou localhost avec Chrome/Safari/Firefox récent.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-950/60 border border-red-700/60 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* CTA principal */}
          <button
            type="button"
            disabled={!isSupported || isBusy}
            onClick={needsRecovery ? recreatePasskey : isLocked ? unlock : () => createAccount(pseudonym)}
            className="w-full bg-red-600 hover:bg-red-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all"
          >
            {isBusy ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Veuillez patienter…
              </span>
            ) : needsRecovery ? (
              'Recréer mon passkey →'
            ) : isLocked ? (
              'Déverrouiller avec passkey →'
            ) : (
              'Créer mon espace avec passkey →'
            )}
          </button>

          {/* Lien de récupération (toujours disponible en mode verrouillé) */}
          {isLocked && !needsRecovery && (
            <button
              type="button"
              disabled={isBusy}
              onClick={recreatePasskey}
              className="w-full text-slate-500 hover:text-slate-300 text-xs mt-3 transition-colors disabled:opacity-40"
            >
              Problème de connexion ? Recréer le passkey sur cet appareil
            </button>
          )}

          <p className="text-slate-600 text-xs text-center mt-4 leading-relaxed">
            {needsRecovery
              ? 'Vos votes locaux sont conservés : la clé de votre appareil est réutilisée.'
              : 'Votre appareil crée une clé locale. Le serveur ne reçoit pas votre identité civile.'}
          </p>
        </div>
      </div>
    </div>
  )
}

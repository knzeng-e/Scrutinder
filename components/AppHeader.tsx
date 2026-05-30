'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useIdentity } from '@/context/IdentityContext'
import { AccountPanel } from './AccountPanel'

interface AppHeaderProps {
  /** Affiche la marque Scrutinder a gauche */
  showBrand?: boolean
  /** Lien retour (remplace la marque si fourni) */
  backHref?: string
  backLabel?: string
}

export function AppHeader({ showBrand = false, backHref, backLabel }: AppHeaderProps) {
  const { identity, status } = useIdentity()
  const [showAccount, setShowAccount] = useState(false)

  const initial = identity?.pseudonym?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 shrink-0 safe-top">
        {/* Gauche : retour ou marque */}
        <div className="min-w-0">
          {backHref ? (
            <Link
              href={backHref}
              className="text-slate-500 hover:text-white text-sm transition-colors flex items-center gap-1"
            >
              <span aria-hidden>←</span> {backLabel ?? 'Retour'}
            </Link>
          ) : showBrand ? (
            <Link href="/" className="font-black text-lg leading-none">
              <span className="text-red-500">Scru</span>tinder
            </Link>
          ) : null}
        </div>

        {/* Droite : bouton compte */}
        {status === 'ready' && identity ? (
          <button
            onClick={() => setShowAccount(true)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <span className="w-7 h-7 rounded-full bg-slate-700 group-hover:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-200 transition-colors">
              {initial}
            </span>
            <span className="text-sm hidden sm:inline truncate max-w-32">
              {identity.pseudonym}
            </span>
          </button>
        ) : status === 'locked' || status === 'onboarding' ? (
          <Link href="/" className="text-red-400 hover:text-red-300 text-sm transition-colors">
            Connexion
          </Link>
        ) : null}
      </header>

      {showAccount && <AccountPanel onClose={() => setShowAccount(false)} />}
    </>
  )
}

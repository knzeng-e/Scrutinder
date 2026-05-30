'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIdentity } from '@/context/IdentityContext'
import { IdentityGate } from '@/components/IdentityGate'
import { AccountPanel } from '@/components/AccountPanel'

export default function HomePage() {
  const { identity, status } = useIdentity()
  const router = useRouter()
  const [showAccount, setShowAccount] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'onboarding' || status === 'locked') {
    return <IdentityGate />
  }

  return (
    <>
      <main className="max-w-md mx-auto px-4 py-10 safe-top min-h-screen flex flex-col">
        {/* En-tete marque */}
        <header className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">
              <span className="text-red-500">Scru</span>tinder
            </h1>
            <p className="text-muted text-sm">
              Bonjour,{' '}
              <span className="text-ink">{identity?.pseudonym}</span>
            </p>
          </div>
          <button
            onClick={() => setShowAccount(true)}
            className="w-10 h-10 rounded-full bg-surface2 hover:bg-surface3 flex items-center justify-center text-sm font-bold text-ink transition-colors mt-1"
            aria-label="Mon compte"
          >
            {identity?.pseudonym?.[0]?.toUpperCase() ?? '?'}
          </button>
        </header>

        {/* Actions principales */}
        <div className="space-y-3 flex-1">
          <button
            onClick={() => router.push('/swipe')}
            className="w-full bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-semibold py-5 px-6 rounded-2xl text-left transition-all"
          >
            <div className="text-xl mb-0.5">Swiper les mesures →</div>
            <div className="text-sm text-red-200 font-normal">
              8 mesures aleatoires par round
            </div>
          </button>

          <button
            onClick={() => router.push('/programme')}
            className="w-full bg-surface2 hover:bg-surface3 active:scale-[0.98] text-ink font-semibold py-5 px-6 rounded-2xl text-left transition-all"
          >
            <div className="text-xl mb-0.5">Lire le programme</div>
            <div className="text-sm text-muted font-normal">
              L&apos;Avenir en Commun — 19 chapitres
            </div>
          </button>

          <button
            onClick={() => router.push('/resultats')}
            className="w-full bg-surface2 hover:bg-surface3 active:scale-[0.98] text-ink font-semibold py-5 px-6 rounded-2xl text-left transition-all"
          >
            <div className="text-xl mb-0.5">Resultats en direct</div>
            <div className="text-sm text-muted font-normal">
              Sondage agree · hash public de verification
            </div>
          </button>
        </div>

        {/* Pied de page identite */}
        <footer className="mt-10 pt-6 border-t border-line">
          <p className="text-faint text-xs text-center leading-relaxed">
            Votes chiffres localement · Aucune donnee personnelle transmise
            <br />
            <span className="font-mono">{identity?.id?.slice(0, 20)}…</span>
          </p>
        </footer>
      </main>

      {showAccount && <AccountPanel onClose={() => setShowAccount(false)} />}
    </>
  )
}

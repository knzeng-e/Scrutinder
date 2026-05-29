'use client'

import { useRouter } from 'next/navigation'
import { useIdentity } from '@/context/IdentityContext'
import { IdentityGate } from '@/components/IdentityGate'

export default function HomePage() {
  const { identity, status } = useIdentity()
  const router = useRouter()

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
    <main className="max-w-md mx-auto px-4 py-10 safe-top">
      {/* Brand */}
      <header className="mb-10">
        <h1 className="text-3xl font-black tracking-tight mb-1">
          <span className="text-red-500">Scru</span>tinder
        </h1>
        <p className="text-slate-400 text-sm">Bonjour, <span className="text-white">{identity?.pseudonym}</span></p>
      </header>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => router.push('/swipe')}
          className="w-full bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-semibold py-5 px-6 rounded-2xl text-left transition-all"
        >
          <div className="text-xl mb-0.5">Swiper les mesures →</div>
          <div className="text-sm text-red-200 font-normal">8 mesures aléatoires par round</div>
        </button>

        <button
          onClick={() => router.push('/programme')}
          className="w-full bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-semibold py-5 px-6 rounded-2xl text-left transition-all"
        >
          <div className="text-xl mb-0.5">📖 Lire le programme</div>
          <div className="text-sm text-slate-400 font-normal">L'Avenir en Commun — 18 chapitres</div>
        </button>

        <button
          onClick={() => router.push('/resultats')}
          className="w-full bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-semibold py-5 px-6 rounded-2xl text-left transition-all"
        >
          <div className="text-xl mb-0.5">📊 Résultats en direct</div>
          <div className="text-sm text-slate-400 font-normal">Sondage agrégé · hash public de vérification</div>
        </button>
      </div>

      {/* Identity footer */}
      <footer className="mt-10 pt-6 border-t border-slate-800">
        <p className="text-slate-600 text-xs text-center leading-relaxed">
          Votes chiffrés localement · Aucune donnée personnelle transmise<br />
          ID local : <span className="font-mono">{identity?.id?.slice(0, 16)}…</span>
        </p>
      </footer>
    </main>
  )
}

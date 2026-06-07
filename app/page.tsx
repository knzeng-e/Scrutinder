'use client'

import { useIdentity } from '@/context/IdentityContext'
import { IdentityGate } from '@/components/IdentityGate'
import { Home } from '@/components/Home'
import { BottomNav } from '@/components/pp/BottomNav'

export default function HomePage() {
  const { status } = useIdentity()

  if (status === 'loading') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </div>
    )
  }

  if (status === 'onboarding' || status === 'locked') {
    return <IdentityGate />
  }

  return (
    <>
      <Home />
      <BottomNav />
    </>
  )
}

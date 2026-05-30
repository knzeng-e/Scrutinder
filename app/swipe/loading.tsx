import { SkeletonHeader } from '@/components/SkeletonHeader'

export default function Loading() {
  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto">
      <SkeletonHeader />
      {/* Barre de progression */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0">
        <div className="skeleton h-4 w-10" />
        <div className="skeleton h-1 flex-1" />
      </div>
      {/* Carte */}
      <div className="relative flex-1 px-4 mb-1">
        <div className="skeleton absolute inset-4 !rounded-3xl" />
      </div>
      {/* Boutons d'action */}
      <div className="flex items-center justify-center gap-3 py-5 safe-bottom">
        <div className="skeleton !rounded-full w-11 h-11" />
        <div className="skeleton !rounded-full w-16 h-16" />
        <div className="skeleton !rounded-full w-11 h-11" />
        <div className="skeleton !rounded-full w-16 h-16" />
        <div className="skeleton !rounded-full w-11 h-11" />
      </div>
    </div>
  )
}

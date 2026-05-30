import { SkeletonHeader } from '@/components/SkeletonHeader'

export default function Loading() {
  return (
    <div className="flex flex-col min-h-[100dvh] max-w-2xl mx-auto">
      <SkeletonHeader />
      <div className="flex-1 px-4 py-6">
        {/* Titre */}
        <div className="mb-6">
          <div className="skeleton h-7 w-48 mb-2" />
          <div className="skeleton h-4 w-32" />
        </div>

        {/* Grille de stats (3 + 2) */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>

        {/* Barre empilée */}
        <div className="skeleton h-3 w-full mb-6" />

        {/* Lignes du tableau */}
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

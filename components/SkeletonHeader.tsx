// En-tête statique affiché pendant le chargement (Suspense).
// Pas de logique client — simple placeholder visuel cohérent avec AppHeader.
export function SkeletonHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 shrink-0 safe-top">
      <span className="font-black text-lg leading-none">
        <span className="text-red-500">Scru</span>tinder
      </span>
      <span className="w-7 h-7 rounded-full bg-slate-800 animate-pulse" />
    </header>
  )
}

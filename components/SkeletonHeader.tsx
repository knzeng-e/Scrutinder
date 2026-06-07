// En-tête statique affiché pendant le chargement (Suspense).
export function SkeletonHeader() {
  return (
    <div className="pad" style={{ paddingTop: 14, paddingBottom: 10 }}>
      <div className="skeleton h-3 w-32" style={{ marginBottom: 10 }} />
      <div className="skeleton h-9 w-56" />
    </div>
  )
}

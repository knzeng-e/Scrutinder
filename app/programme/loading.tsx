import { SkeletonHeader } from '@/components/SkeletonHeader'

export default function Loading() {
  return (
    <div className="flex flex-col min-h-[100dvh] max-w-2xl mx-auto">
      <SkeletonHeader />
      <div className="flex-1 px-4 py-6">
        <div className="mb-8">
          <div className="skeleton h-7 w-56 mb-2" />
          <div className="skeleton h-4 w-40" />
        </div>
        {[0, 1].map((group) => (
          <div key={group} className="mb-8">
            <div className="skeleton h-4 w-44 mb-3" />
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-20 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

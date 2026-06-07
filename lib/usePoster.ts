'use client'

import { useMemo } from 'react'
import { useResults } from '@/lib/useResults'
import { resolveStats, type MeasureStats } from '@/lib/stats'
import { computeMeta, type PosterMeta } from '@/lib/poster'

/**
 * Fournit un accès aux statistiques par mesure (réelles ou simulées) et aux
 * méta-compteurs agrégés. Source unique pour accueil / programme / résultats.
 */
export function usePoster(): {
  stat: (id: number) => MeasureStats
  meta: PosterMeta
  loading: boolean
} {
  const { results, loading } = useResults()

  const stat = useMemo(() => {
    const cache = new Map<number, MeasureStats>()
    return (id: number) => {
      let s = cache.get(id)
      if (!s) {
        s = resolveStats(id, results?.votes?.[id])
        cache.set(id, s)
      }
      return s
    }
  }, [results])

  const meta = useMemo(() => computeMeta(results?.votes, results?.hash), [results])

  return { stat, meta, loading }
}

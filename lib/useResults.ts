'use client'

import { useEffect, useState } from 'react'
import type { ResultsData } from '@/types'

/**
 * Récupère les comptages agrégés réels (`/api/results`).
 * Tant qu'ils sont vides, les écrans retombent sur des stats simulées
 * déterministes (voir `lib/stats.ts`).
 */
export function useResults(): { results: ResultsData | null; loading: boolean } {
  const [results, setResults] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/results')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active) {
          setResults(data)
          setLoading(false)
        }
      })
      .catch(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return { results, loading }
}

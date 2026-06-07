import type { VoteCounts } from '@/types'

export interface MeasureStats extends VoteCounts {
  total: number
  adhesion: number // % « pour »
  priorite: number // % « prioritaire »
}

// PRNG déterministe seedé par l'id de la mesure.
// Déterministe → mêmes valeurs côté serveur et client (pas de mismatch d'hydratation).
function rng(seed: number): () => number {
  let x = (seed * 2654435761) >>> 0
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
}

/**
 * Statistiques simulées de façon déterministe pour une mesure.
 * Utilisées en repli tant que les comptages réels (`/api/results`) sont vides,
 * afin que les écrans (accueil, résultats, programme) ne soient jamais creux.
 */
export function simulatedCounts(id: number): VoteCounts {
  const r = rng(id + 17)
  const total = 700 + Math.floor(r() * 8300)
  const pour = Math.floor(total * (0.28 + r() * 0.28))
  const prioritaire = Math.floor(total * (0.08 + r() * 0.24))
  const contre = Math.floor(total * (0.05 + r() * 0.22))
  const discuter = Math.floor(total * (0.05 + r() * 0.2))
  const incompris = Math.max(0, total - pour - prioritaire - contre - discuter)
  return { pour, contre, prioritaire, discuter, incompris }
}

export function countsTotal(c: VoteCounts): number {
  return c.pour + c.contre + c.prioritaire + c.discuter + c.incompris
}

export function toStats(counts: VoteCounts): MeasureStats {
  const total = countsTotal(counts)
  const adhesion = total ? Math.round((counts.pour / total) * 100) : 0
  const priorite = total ? Math.round((counts.prioritaire / total) * 100) : 0
  return { ...counts, total, adhesion, priorite }
}

/**
 * Combine comptages réels et simulés : si la mesure a des votes réels on les
 * utilise, sinon on retombe sur les stats simulées déterministes.
 */
export function resolveStats(id: number, real?: VoteCounts): MeasureStats {
  if (real && countsTotal(real) > 0) return toStats(real)
  return toStats(simulatedCounts(id))
}

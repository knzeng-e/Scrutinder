import type { Measure } from '@/types'
import { measures, program } from '@/lib/measures'
import { simulatedCounts, countsTotal } from '@/lib/stats'

// ── Illustrations de campagne (public/images/assets/NNN_*.png) ────────────────
export const ASSET_FILES: Record<number, string> = {
  1: '001_Le_pouvoir_au_peuple.png',
  2: '002_Retraite_a_60_ans.png',
  3: '003_Augmenter_les_salaires_et_reconnaitre_le_travail.png',
  4: '004_Bloquer_les_prix_des_produits_de_premiere_necessite.png',
  5: '005_Elever_le_niveau_d_instruction.png',
  6: '006_Reconstruire_l_hopital_public.png',
  7: '007_Planification_ecologique.png',
  8: '008_Renovation_energetique_des_logements.png',
  9: '009_L_eau_bien_commun.png',
  10: '010_Relocaliser_et_reindustrialiser.png',
  11: '011_Convoquer_une_Assemblee_constituante_pour_la_6e_Republique.png',
  12: '012_Generaliser_l_economie_sociale_et_solidaire.png',
  13: '013_Travailler_tous_travailler_moins_travailler_mieux.png',
  14: '014_Faire_place_a_la_nouvelle_France.png',
  15: '015_Humaniser_par_la_culture_et_le_sport.png',
  16: '016_100_pourcent_d_energies_renouvelables_en_2050.png',
  17: '017_Proteger_la_biodiversite_et_les_ecosystemes.png',
  18: '018_Une_approche_de_sante_globale.png',
  19: '019_Agir_pour_le_respect_du_droit_international_contre_les_guerres.png',
  20: '020_Construire_une_relation_avec_l_Afrique_basee_sur_la_souverainete_des_peuples.png',
}

export const assetUrl = (n: number) => `/images/assets/${ASSET_FILES[n] ?? ASSET_FILES[1]}`

// Image d'une mesure : `imageUrl` est déjà mappé dans les données.
export function measureImage(m: Measure): string {
  return m.imageUrl && m.imageUrl.includes('/assets/') ? m.imageUrl : assetUrl(chapterNum(m))
}

// Numéro de chapitre (1-18) déduit de l'URL programme (.../chapitreN/...).
export function chapterNum(m: Measure): number {
  const match = (m.programUrl || '').match(/chapitre(\d+)/)
  return match ? Number(match[1]) : 1
}

// Couleur de pastille par chapitre (rotation de la palette).
const CH_COLORS = ['violet', 'red', 'blue', 'green', 'pink', 'lav'] as const
export type ChipColor = (typeof CH_COLORS)[number]
export const chapterColor = (n: number): ChipColor => CH_COLORS[n % CH_COLORS.length]

// Image de chapitre (reprend le mapping curé du design).
const CH_IMAGE: Record<number, number> = {
  1: 11, 2: 9, 3: 3, 4: 2, 5: 5, 6: 12, 7: 6, 8: 13, 9: 10,
  10: 14, 11: 15, 12: 7, 13: 8, 14: 17, 15: 18, 16: 19, 17: 20, 18: 16,
}

// ── Format ────────────────────────────────────────────────────────────────────
export const fmt = (n: number) => n.toLocaleString('fr-FR')

// ── Métadonnées chapitres (program.json, hors préambule) ──────────────────────
export interface ChapterMeta {
  num: number
  id: string
  title: string
  part: string
  summary: string
  imageUrl: string
  count: number
  url: string
}

const measureCountByChapter: Record<number, number> = (() => {
  const acc: Record<number, number> = {}
  for (const m of measures) {
    const n = chapterNum(m)
    acc[n] = (acc[n] ?? 0) + 1
  }
  return acc
})()

export const chapters: ChapterMeta[] = program
  .filter((c) => /^ch\d+$/.test(c.id))
  .map((c) => {
    const num = Number(c.id.replace('ch', ''))
    return {
      num,
      id: c.id,
      title: c.title,
      part: c.part,
      summary: c.summary,
      imageUrl: assetUrl(CH_IMAGE[num] ?? num),
      count: measureCountByChapter[num] ?? 0,
      url: c.url,
    }
  })
  .sort((a, b) => a.num - b.num)

export function measuresByChapter(num: number): Measure[] {
  return measures.filter((m) => chapterNum(m) === num)
}

// ── Méta-compteurs agrégés (réels si fournis, sinon simulés) ──────────────────
export interface PosterMeta {
  participants: number
  totalVotes: number
  contributions: number
  measuresTotal: number
  chaptersTotal: number
  hash: string
}

export function computeMeta(
  votes?: Record<number, import('@/types').VoteCounts>,
  hash?: string,
): PosterMeta {
  let totalVotes = 0
  for (const m of measures) {
    const real = votes?.[m.id]
    totalVotes += real && countsTotal(real) > 0 ? countsTotal(real) : countsTotal(simulatedCounts(m.id))
  }
  return {
    totalVotes,
    participants: Math.round(totalVotes / 14.6),
    contributions: 15214,
    measuresTotal: measures.length,
    chaptersTotal: chapters.length,
    hash: (hash || 'b7f3a91c4e2d8056').slice(0, 16),
  }
}

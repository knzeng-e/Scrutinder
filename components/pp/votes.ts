import type { VoteChoice } from '@/types'
import type { IconName } from './Icon'

export interface VoteConfig {
  label: string
  icon: IconName
  color: string // couleur pleine (texte/barre)
  bg: string // fond doux / ombre
  ink: string // texte foncé
  verb: string // libellé majuscule swipe
  filled: boolean // icône remplie quand actif
}

export const VOTES: Record<VoteChoice, VoteConfig> = {
  pour:        { label: 'Pour',        icon: 'check', color: '#5C8946',  bg: '#D4E9D6', ink: '#456A33',  verb: 'POUR',        filled: true },
  contre:      { label: 'Contre',      icon: 'x',     color: '#D1271C',  bg: '#FFD2CF', ink: '#A81910',  verb: 'CONTRE',      filled: false },
  prioritaire: { label: 'Prioritaire', icon: 'star',  color: '#4C0297',  bg: '#E5CBFF', ink: '#37016E',  verb: 'PRIORITAIRE', filled: true },
  discuter:    { label: 'À discuter',  icon: 'chat',  color: '#175C9E',  bg: '#BEE2FF', ink: '#175C9E',  verb: 'À DISCUTER',  filled: false },
  incompris:   { label: 'Incompris',   icon: 'help',  color: '#706F6F',  bg: '#ECEAE6', ink: '#706F6F',  verb: 'INCOMPRIS',   filled: false },
}

// Ordre d'affichage dans les sélecteurs (le « pour » au centre dans la barre de swipe).
export const VOTE_ORDER: VoteChoice[] = ['pour', 'prioritaire', 'contre', 'discuter', 'incompris']

// Ordre des segments de la barre de répartition.
export const DIST_ORDER: VoteChoice[] = ['pour', 'prioritaire', 'discuter', 'incompris', 'contre']

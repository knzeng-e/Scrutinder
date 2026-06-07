export type VoteChoice = 'pour' | 'contre' | 'discuter' | 'prioritaire' | 'incompris'

export interface Measure {
  id: number
  title: string
  summary: string
  details?: string
  chapter: string
  section?: string
  programUrl?: string
  isKeyMeasure?: boolean
  imageUrl?: string
}

export interface ProgramChapter {
  id: string
  title: string
  part: string
  summary: string
  content: Array<{ type: 'h2' | 'h3' | 'p'; text: string }>
  url: string
}

export interface Identity {
  id: string           // "sc_<hex32>" - derived from sha256(seed)
  pseudonym: string
  seed: string         // base64, 32 bytes - NEVER send to server
  createdAt: string
  passkey?: {
    credentialId: string
    userHandle: string
    createdAt: string
  }
  authenticatedAt?: string
}

export interface EncryptedVoteEnvelope {
  alg: 'AES-GCM'
  kid: string          // identity.id
  iv: string           // base64
  ciphertext: string   // base64
}

export interface VotePayload {
  measureId: number
  choice: VoteChoice
  votedAt: string
}

export interface VoteCounts {
  pour: number
  contre: number
  discuter: number
  prioritaire: number
  incompris: number
}

export interface ResultsData {
  votes: Record<number, VoteCounts>
  hash: string
}

export type AuthStatus = 'loading' | 'onboarding' | 'locked' | 'ready'

export interface Comment {
  id: string
  measureId: number
  voterId: string | null
  pseudonym: string
  body: string
  createdAt: string
}

export interface Contribution {
  id: string
  measureId: number | null
  voterId: string | null
  pseudonym: string
  body: string
  createdAt: string
}

import { createHash } from 'crypto'
import type { VoteCounts } from '@/types'

export function computeVoteHash(votes: Record<number, VoteCounts>): string {
  return createHash('sha256').update(JSON.stringify(votes)).digest('hex')
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { measures } from '@/lib/measures'
import { computeVoteHash } from '@/lib/crypto'
import type { VoteCounts } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await prisma.vote.groupBy({
    by: ['measureId', 'choice'],
    _count: { id: true },
  })

  const votes: Record<number, VoteCounts> = {}
  for (const m of measures) {
    votes[m.id] = { pour: 0, contre: 0, discuter: 0, prioritaire: 0, incompris: 0 }
  }
  for (const row of rows) {
    const bucket = votes[row.measureId]
    if (bucket && row.choice in bucket) {
      (bucket as unknown as Record<string, number>)[row.choice] = row._count.id
    }
  }

  return NextResponse.json({ votes, hash: computeVoteHash(votes) })
}

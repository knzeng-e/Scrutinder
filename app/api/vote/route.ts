import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getMeasureById } from '@/lib/measures'

const schema = z.object({
  id: z.number().int().positive(),
  choice: z.enum(['pour', 'contre', 'discuter', 'prioritaire', 'incompris']),
  voterId: z.string().optional(),
  encryptedVote: z.unknown().optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données de vote invalides', issues: parsed.error.issues }, { status: 400 })
  }

  const { id, choice, voterId, encryptedVote } = parsed.data

  if (!getMeasureById(id)) {
    return NextResponse.json({ error: 'Identifiant de mesure inconnu' }, { status: 400 })
  }

  await prisma.vote.create({
    data: {
      measureId: id,
      choice,
      voterId: voterId ?? null,
      encryptedVote: encryptedVote !== undefined ? (encryptedVote as object) : undefined,
    },
  })

  return NextResponse.json({ status: 'ok' })
}

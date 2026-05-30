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
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données de vote invalides', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { id, choice, voterId, encryptedVote } = parsed.data

  if (!getMeasureById(id)) {
    return NextResponse.json({ error: 'Identifiant de mesure inconnu' }, { status: 400 })
  }

  const envelope = encryptedVote !== undefined ? (encryptedVote as object) : undefined

  // Intégrité du sondage : un votant identifié ne compte qu'une fois par mesure.
  // Re-voter sur la même mesure remplace le choix précédent (upsert).
  // Les votes anonymes (sans voterId) sont toujours insérés.
  if (voterId) {
    await prisma.vote.upsert({
      where: { voterId_measureId: { voterId, measureId: id } },
      update: { choice, encryptedVote: envelope },
      create: { measureId: id, choice, voterId, encryptedVote: envelope },
    })
  } else {
    await prisma.vote.create({
      data: { measureId: id, choice, encryptedVote: envelope },
    })
  }

  return NextResponse.json({ status: 'ok' })
}

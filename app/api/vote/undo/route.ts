import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  id: z.number().int().positive(),
  choice: z.enum(['pour', 'contre', 'discuter', 'prioritaire', 'incompris']),
  voterId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const { id, choice, voterId } = parsed.data

  const vote = await prisma.vote.findFirst({
    where: {
      measureId: id,
      choice,
      ...(voterId ? { voterId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  if (vote) {
    await prisma.vote.delete({ where: { id: vote.id } })
  }

  return NextResponse.json({ status: 'ok' })
}

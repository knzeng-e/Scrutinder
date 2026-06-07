import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getMeasureById } from '@/lib/measures'

export const dynamic = 'force-dynamic'

const schema = z.object({
  pseudonym: z.string().trim().min(1).max(40),
  body: z.string().trim().min(1).max(2000),
  voterId: z.string().optional(),
})

// GET - liste des commentaires d'une mesure (plus récents d'abord)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const measureId = Number(id)
  if (!Number.isInteger(measureId)) {
    return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
  }
  const comments = await prisma.comment.findMany({
    where: { measureId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(comments)
}

// POST - ajoute un commentaire à une mesure
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const measureId = Number(id)
  if (!getMeasureById(measureId)) {
    return NextResponse.json({ error: 'Mesure inconnue' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      measureId,
      pseudonym: parsed.data.pseudonym,
      body: parsed.data.body,
      voterId: parsed.data.voterId ?? null,
    },
  })
  return NextResponse.json(comment, { status: 201 })
}

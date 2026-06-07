import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getMeasureById } from '@/lib/measures'

export const dynamic = 'force-dynamic'

const schema = z.object({
  measureId: z.number().int().positive().optional(),
  pseudonym: z.string().trim().min(1).max(40),
  body: z.string().trim().min(1).max(2000),
  voterId: z.string().optional(),
})

// GET - liste des contributions (filtrable par ?measureId=)
export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get('measureId')
  const measureId = param ? Number(param) : undefined

  const contributions = await prisma.contribution.findMany({
    where: measureId !== undefined ? { measureId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(contributions)
}

// POST - soumet une idée / contribution
export async function POST(req: NextRequest) {
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

  // Si une mesure est ciblée, elle doit exister
  if (parsed.data.measureId !== undefined && !getMeasureById(parsed.data.measureId)) {
    return NextResponse.json({ error: 'Mesure inconnue' }, { status: 400 })
  }

  const contribution = await prisma.contribution.create({
    data: {
      measureId: parsed.data.measureId ?? null,
      pseudonym: parsed.data.pseudonym,
      body: parsed.data.body,
      voterId: parsed.data.voterId ?? null,
    },
  })
  return NextResponse.json(contribution, { status: 201 })
}

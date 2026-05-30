import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateAuthenticationOptionsForUser } from '@/lib/identity.server'

const schema = z.object({
  userId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  try {
    const options = await generateAuthenticationOptionsForUser(parsed.data.userId)
    return NextResponse.json(options)
  } catch (e) {
    return NextResponse.json({ error: 'Échec de la génération des options' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAuthenticationForUser } from '@/lib/identity.server'

const schema = z.object({
  userId: z.string().min(1),
  response: z.unknown(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  try {
    const verified = await verifyAuthenticationForUser(parsed.data.userId, parsed.data.response)
    return NextResponse.json({ verified })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec de l\'authentification'
    return NextResponse.json({ verified: false, error: message }, { status: 400 })
  }
}

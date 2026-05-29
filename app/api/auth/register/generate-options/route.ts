import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateRegistrationOptionsForUser } from '@/lib/identity.server'

const schema = z.object({
  userId: z.string().min(1),
  pseudonym: z.string().default(''),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  try {
    const options = await generateRegistrationOptionsForUser(parsed.data.userId, parsed.data.pseudonym)
    return NextResponse.json(options)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate options' }, { status: 500 })
  }
}

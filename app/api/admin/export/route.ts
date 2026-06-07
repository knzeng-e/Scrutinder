import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { measures } from '@/lib/measures'
import { checkAdmin } from '@/lib/admin'
import type { VoteChoice } from '@/types'

export const dynamic = 'force-dynamic'

const CHOICES: VoteChoice[] = ['pour', 'contre', 'prioritaire', 'discuter', 'incompris']

// Échappe un champ CSV (guillemets, virgules, sauts de ligne).
function csvField(value: string | number): string {
  const s = String(value)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

// GET - export CSV des résultats agrégés. Auth via ?key=<mot de passe>.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!checkAdmin(key)) {
    return new NextResponse('Non autorisé', { status: 401 })
  }

  const rows = await prisma.vote.groupBy({
    by: ['measureId', 'choice'],
    _count: { id: true },
  })

  // Agrège les comptes par mesure
  const counts = new Map<number, Record<string, number>>()
  for (const m of measures) {
    counts.set(m.id, { pour: 0, contre: 0, prioritaire: 0, discuter: 0, incompris: 0 })
  }
  for (const row of rows) {
    const c = counts.get(row.measureId)
    if (c && row.choice in c) c[row.choice] = row._count.id
  }

  const header = ['id', 'titre', 'chapitre', ...CHOICES, 'total'].join(',')
  const lines = measures.map((m) => {
    const c = counts.get(m.id)!
    const total = CHOICES.reduce((s, k) => s + c[k], 0)
    return [
      m.id,
      csvField(m.title),
      csvField(m.chapter),
      ...CHOICES.map((k) => c[k]),
      total,
    ].join(',')
  })

  const csv = [header, ...lines].join('\n')
  const filename = `scrutinder-resultats-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

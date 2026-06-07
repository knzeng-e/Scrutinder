import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getMeasureById } from '@/lib/measures'
import { checkAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

// POST - renvoie les statistiques admin. Auth via en-tête Authorization: Bearer <mot de passe>.
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!checkAdmin(auth)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const [totalVotes, totalComments, totalContributions, debatedRaw, recentContributions] =
    await Promise.all([
      prisma.vote.count(),
      prisma.comment.count(),
      prisma.contribution.count(),
      prisma.vote.groupBy({
        by: ['measureId'],
        where: { choice: 'discuter' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
      prisma.contribution.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    ])

  const debated = debatedRaw.map((row) => ({
    measureId: row.measureId,
    title: getMeasureById(row.measureId)?.title ?? `Mesure #${row.measureId}`,
    discuter: row._count.id,
  }))

  return NextResponse.json({
    totalVotes,
    totalComments,
    totalContributions,
    debated,
    recentContributions,
  })
}

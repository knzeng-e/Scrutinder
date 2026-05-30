import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const alt = 'Scrutinder — résultats du sondage citoyen'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Total de votes — tolérant aux pannes : 0 si la DB est indisponible.
  let totalVotes = 0
  try {
    totalVotes = await prisma.vote.count()
  } catch {
    totalVotes = 0
  }

  const formatted = new Intl.NumberFormat('fr-FR').format(totalVotes)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Marque */}
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 900, marginBottom: 24 }}>
          <span style={{ color: '#CC0A2B' }}>Scru</span>
          <span style={{ color: '#ffffff' }}>tinder</span>
        </div>

        {/* Compteur de votes */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 16 }}>
          <span style={{ fontSize: 120, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
            {formatted}
          </span>
          <span style={{ fontSize: 44, color: '#94a3b8' }}>votes citoyens</span>
        </div>

        {/* Accroche */}
        <div style={{ fontSize: 40, color: '#cbd5e1', maxWidth: 900 }}>
          Swipez le programme. Mesurez l&apos;adhésion populaire.
        </div>

        {/* Barre accent */}
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            height: 12,
            width: 400,
            borderRadius: 6,
            background: '#CC0A2B',
          }}
        />
      </div>
    ),
    { ...size }
  )
}

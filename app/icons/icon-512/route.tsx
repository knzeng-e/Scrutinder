import { ImageResponse } from 'next/og'
import { iconMark } from '@/lib/icon-mark'

export const runtime = 'nodejs'

// Icône PWA 512×512 (référencée dans le manifest).
export function GET() {
  return new ImageResponse(iconMark(512), { width: 512, height: 512 })
}

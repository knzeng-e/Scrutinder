import { ImageResponse } from 'next/og'
import { iconMark } from '@/lib/icon-mark'

export const runtime = 'nodejs'

// Icône PWA 192×192 (référencée dans le manifest).
export function GET() {
  return new ImageResponse(iconMark(192), { width: 192, height: 192 })
}

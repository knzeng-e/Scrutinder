import { ImageResponse } from 'next/og'
import { iconMark } from '@/lib/icon-mark'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(iconMark(64), { ...size })
}

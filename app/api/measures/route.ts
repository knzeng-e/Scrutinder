import { NextResponse } from 'next/server'
import { measures } from '@/lib/measures'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json(measures)
}

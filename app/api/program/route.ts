import { NextResponse } from 'next/server'
import { program } from '@/lib/measures'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json(program)
}

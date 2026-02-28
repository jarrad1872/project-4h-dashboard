import { NextResponse } from 'next/server'
import { getProjectState } from '@/lib/project-state-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(getProjectState())
}

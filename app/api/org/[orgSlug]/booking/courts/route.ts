import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndDb } from '@/lib/db/api-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params
    const { db } = await getSessionAndDb(request)
    
    const courts = await db.execute(`
      SELECT id, name, type, is_active 
      FROM courts 
      WHERE is_active = true
      ORDER BY name
    `)
    
    return NextResponse.json(courts.rows)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching courts' }, { status: 500 })
  }
}
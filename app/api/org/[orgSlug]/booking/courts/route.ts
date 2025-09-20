// app/api/org/[orgSlug]/booking/courts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndDb } from '@/lib/db/api-helpers'
import { sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params
    const { session, db, orgSlug: verifiedOrgSlug } = await getSessionAndDb()
    
    const courts = await db.execute(sql`
      SELECT id, name, type, is_active, created_at, updated_at 
      FROM courts 
      WHERE organization_id = ${session.user.organizationId}
      ORDER BY name
    `)
    
    return NextResponse.json({ courts: courts.rows })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching courts' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  console.log('Se ejecuta 😎')
  try {
    const { orgSlug } = await params
    const { session, db } = await getSessionAndDb()
    const { name, type } = await request.json()

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type required' }, { status: 400 })
    }

    const result = await db.execute(sql`
      INSERT INTO courts (name, type, organization_id, created_by)
      VALUES (${name}, ${type}, ${session.user.organizationId}, ${session.user.id})
      RETURNING *
    `)
      console.log(result)
    return NextResponse.json({ court: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating court' }, { status: 500 })
  }
}
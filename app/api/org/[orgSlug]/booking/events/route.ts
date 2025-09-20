
// app/api/org/[orgSlug]/booking/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndDb } from '@/lib/db/api-helpers'
import { sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params
    const { session, db } = await getSessionAndDb()
    const { searchParams } = new URL(request.url)
    
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    let query = sql`
      SELECT * FROM events 
      WHERE organization_id = ${session.user.organizationId}
    `

    if (startDate && endDate) {
      query = sql`${query} AND date >= ${startDate} AND date <= ${endDate}`
    }

    query = sql`${query} ORDER BY date ASC, start_time ASC`

    const events = await db.execute(query)
    
    return NextResponse.json({ events: events.rows })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching events' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params
    const { session, db } = await getSessionAndDb()
    const { name, date, startTime, endTime, courtIds } = await request.json()

    if (!name || !date || !startTime || !endTime || !courtIds?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await db.execute(sql`
      INSERT INTO events (name, date, start_time, end_time, court_ids, organization_id, created_by)
      VALUES (${name}, ${date}, ${startTime}, ${endTime}, ${JSON.stringify(courtIds)}, ${session.user.organizationId}, ${session.user.id})
      RETURNING *
    `)

    return NextResponse.json({ event: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 })
  }
}
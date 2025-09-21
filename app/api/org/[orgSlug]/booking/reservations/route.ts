
// app/api/org/[orgSlug]/booking/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndDb } from '@/lib/db/api-helpers'
import { sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest
) {
  try {
    const { session, db } = await getSessionAndDb()
    const { searchParams } = new URL(request.url)
    
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const courtId = searchParams.get('courtId')

    let query = sql`
      SELECT 
        cr.*,
        c.name as court_name,
        c.type as court_type
      FROM court_reservations cr
      JOIN courts c ON cr.court_id = c.id
      WHERE cr.organization_id = ${session.user.organizationId}
    `

    const conditions = []
    
    if (startDate && endDate) {
      conditions.push(sql`cr.start_time >= ${startDate} AND cr.start_time <= ${endDate}`)
    }
    
    if (courtId) {
      conditions.push(sql`cr.court_id = ${courtId}`)
    }

    if (conditions.length > 0) {
      query = sql`${query} AND ${sql.join(conditions, sql` AND `)}`
    }

    query = sql`${query} ORDER BY cr.start_time ASC`

    const reservations = await db.execute(query)
    
    return NextResponse.json({ reservations: reservations.rows })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching reservations' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params
    const { session, db } = await getSessionAndDb()
    const {
      courtId,
      name,
      phone,
      startTime,
      endTime,
      paymentMethod = 'pending',
      isRecurring = false,
      recurrenceEnd,
      paidSessions,
      paymentNotes
    } = await request.json()

    // Validaciones básicas
    if (!courtId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verificar conflictos de horario
    const conflicts = await db.execute(sql`
      SELECT id FROM court_reservations
      WHERE court_id = ${courtId}
      AND status IN ('confirmed', 'completed')
      AND (
        (start_time <= ${startTime} AND end_time > ${startTime}) OR
        (start_time < ${endTime} AND end_time >= ${endTime}) OR
        (start_time >= ${startTime} AND end_time <= ${endTime})
      )
    `)

    if (conflicts.rows.length > 0) {
      return NextResponse.json({ error: 'Time slot conflict' }, { status: 409 })
    }

    const result = await db.execute(sql`
      INSERT INTO court_reservations (
        court_id, name, phone, start_time, end_time, payment_method,
        is_recurring, recurrence_end, paid_sessions, payment_notes,
        organization_id, created_by
      ) VALUES (
        ${courtId}, ${name}, ${phone}, ${startTime}, ${endTime}, ${paymentMethod},
        ${isRecurring}, ${recurrenceEnd}, ${paidSessions}, ${paymentNotes},
        ${session.user.organizationId}, ${session.user.id}
      ) RETURNING *
    `)

    return NextResponse.json({ reservation: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating reservation' }, { status: 500 })
  }
}
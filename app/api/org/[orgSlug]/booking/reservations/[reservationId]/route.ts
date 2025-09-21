// app/api/org/[orgSlug]/booking/reservations/[reservationId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndDb } from '@/lib/db/api-helpers'
import { sql } from 'drizzle-orm'

export async function PUT(
  request: NextRequest
) {
  try {
    const { session, db } = await getSessionAndDb()
    const updateData = await request.json()

    // Construir query dinámicamente
    const setClause = []
    const values = []

    if (updateData.name !== undefined) {
      setClause.push('name = $' + (values.length + 1))
      values.push(updateData.name)
    }
    if (updateData.phone !== undefined) {
      setClause.push('phone = $' + (values.length + 1))
      values.push(updateData.phone)
    }
    if (updateData.startTime !== undefined) {
      setClause.push('start_time = $' + (values.length + 1))
      values.push(updateData.startTime)
    }
    if (updateData.endTime !== undefined) {
      setClause.push('end_time = $' + (values.length + 1))
      values.push(updateData.endTime)
    }
    if (updateData.paymentMethod !== undefined) {
      setClause.push('payment_method = $' + (values.length + 1))
      values.push(updateData.paymentMethod)
    }
    if (updateData.status !== undefined) {
      setClause.push('status = $' + (values.length + 1))
      values.push(updateData.status)
    }

    setClause.push('updated_at = now()')

    const result = await db.execute(sql`
      UPDATE court_reservations 
      SET ${sql.raw(setClause.join(', '))}
      WHERE id = ${reservationId} AND organization_id = ${session.user.organizationId}
      RETURNING *
    `)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return NextResponse.json({ reservation: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Error updating reservation' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; reservationId: string }> }
) {
  try {
    const { orgSlug, reservationId } = await params
    const { session, db } = await getSessionAndDb()

    const result = await db.execute(sql`
      DELETE FROM court_reservations 
      WHERE id = ${reservationId} AND organization_id = ${session.user.organizationId}
      RETURNING id
    `)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting reservation' }, { status: 500 })
  }
}

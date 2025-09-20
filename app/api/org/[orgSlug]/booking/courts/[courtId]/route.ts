
// app/api/org/[orgSlug]/booking/courts/[courtId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndDb } from '@/lib/db/api-helpers'
import { sql } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; courtId: string }> }
) {
  try {
    const { orgSlug, courtId } = await params
    const { session, db } = await getSessionAndDb()
    const { name, type, isActive } = await request.json()

    const result = await db.execute(sql`
      UPDATE courts 
      SET name = ${name}, type = ${type}, is_active = ${isActive}, updated_at = now()
      WHERE id = ${courtId} AND organization_id = ${session.user.organizationId}
      RETURNING *
    `)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 })
    }

    return NextResponse.json({ court: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Error updating court' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; courtId: string }> }
) {
  try {
    const { orgSlug, courtId } = await params
    const { session, db } = await getSessionAndDb()

    // Verificar si hay reservas activas
    const reservations = await db.execute(sql`
      SELECT id FROM court_reservations 
      WHERE court_id = ${courtId} AND status = 'confirmed'
    `)

    if (reservations.rows.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete court with active reservations' 
      }, { status: 400 })
    }

    const result = await db.execute(sql`
      DELETE FROM courts 
      WHERE id = ${courtId} AND organization_id = ${session.user.organizationId}
      RETURNING id
    `)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting court' }, { status: 500 })
  }
}

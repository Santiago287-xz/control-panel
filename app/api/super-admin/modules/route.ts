// app/api/super-admin/modules/route.ts - VERSION 1.1
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { adminDb } from '@/lib/db/tenant'
import { modules } from '@/lib/db/schema'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener módulos (sin pageCount ya que no hay modulePages)
    const modulesList = await adminDb.select().from(modules)

    return NextResponse.json({ modules: modulesList })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
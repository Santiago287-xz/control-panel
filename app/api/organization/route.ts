import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allOrganizations = await db.select().from(organizations)
    return NextResponse.json({ organizations: allOrganizations })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
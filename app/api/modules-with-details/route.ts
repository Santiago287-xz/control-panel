import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { modules } from '@/lib/db/schema'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allModules = await db.select().from(modules)
    return NextResponse.json({ modules: allModules })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
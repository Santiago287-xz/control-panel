import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { modules } from '@/lib/db/schema'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allModules = await db.select().from(modules)
    return NextResponse.json({ modules: allModules })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, displayName, description, category } = body

    const [newModule] = await db.insert(modules).values({
      name,
      displayName,
      description,
      category,
    }).returning()

    return NextResponse.json({ module: newModule })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
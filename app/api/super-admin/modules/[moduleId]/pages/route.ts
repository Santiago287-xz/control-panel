import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { modulePages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    const { moduleId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pages = await db.select().from(modulePages).where(eq(modulePages.moduleId, moduleId))
    return NextResponse.json({ pages })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    const { moduleId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, displayName, routePath, description, icon, requiresId, sortOrder } = body

    const [newPage] = await db.insert(modulePages).values({
      moduleId,
      name,
      displayName,
      routePath,
      description,
      icon,
      requiresId: requiresId || false,
      sortOrder: sortOrder || 0,
    }).returning()

    return NextResponse.json({ page: newPage })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
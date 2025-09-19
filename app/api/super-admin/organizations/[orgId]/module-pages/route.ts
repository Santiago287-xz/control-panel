import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { organizationModulePages, modulePages, modules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { modulePageId, canRead, canWrite, canDelete } = body

    const [permission] = await db.insert(organizationModulePages).values({
      organizationId: orgId,
      modulePageId,
      canRead: canRead || false,
      canWrite: canWrite || false,
      canDelete: canDelete || false,
      grantedBy: session.user.id,
    }).onConflictDoUpdate({
      target: [organizationModulePages.organizationId, organizationModulePages.modulePageId],
      set: {
        canRead: canRead || false,
        canWrite: canWrite || false,
        canDelete: canDelete || false,
        grantedBy: session.user.id,
      }
    }).returning()

    return NextResponse.json({ permission })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const permissions = await db
      .select({
        id: organizationModulePages.id,
        modulePageId: organizationModulePages.modulePageId,
        canRead: organizationModulePages.canRead,
        canWrite: organizationModulePages.canWrite,
        canDelete: organizationModulePages.canDelete,
        pageName: modulePages.name,
        pageDisplayName: modulePages.displayName,
        pageRoutePath: modulePages.routePath,
        moduleName: modules.name,
        moduleDisplayName: modules.displayName,
      })
      .from(organizationModulePages)
      .innerJoin(modulePages, eq(organizationModulePages.modulePageId, modulePages.id))
      .innerJoin(modules, eq(modulePages.moduleId, modules.id))
      .where(eq(organizationModulePages.organizationId, orgId))

    return NextResponse.json({ permissions })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndDb } from '@/lib/db/api-helpers'
import { organizationModules, modules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { session, db, isAdmin } = await getSessionAndDb(request)

    // Super admins have access to all modules
    if (isAdmin) {
      const allModules = await db.select().from(modules)
      const permissions = allModules.map(module => ({
        moduleId: module.id,
        moduleName: module.name,
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManage: true
      }))
      return NextResponse.json({ permissions })
    }

    // Tenant users - get org enabled modules
    if (!session.user.organizationId) {
      return NextResponse.json({ permissions: [] })
    }

    const orgModules = await db
      .select({
        moduleId: modules.id,
        moduleName: modules.name,
        displayName: modules.displayName
      })
      .from(organizationModules)
      .innerJoin(modules, eq(organizationModules.moduleId, modules.id))
      .where(
        and(
          eq(organizationModules.organizationId, session.user.organizationId),
          eq(organizationModules.isEnabled, true)
        )
      )

    const permissions = orgModules.map(module => ({
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      canRead: true,
      canWrite: true, 
      canDelete: false,
      canManage: false
    }))

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
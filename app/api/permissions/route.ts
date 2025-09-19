// app/api/permissions/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { organizationModules, modules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getUserModulePermissions } from '@/lib/modules/registry'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Super admins have access to all modules
    if (session.user.isSuperAdmin) {
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

    // Regular users - get org enabled modules + role permissions
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

    const permissions = orgModules.map(module => {
      const userPermissions = getUserModulePermissions(module.moduleName, session.user.role)
      return {
        moduleId: module.moduleId,
        moduleName: module.moduleName,
        canRead: userPermissions.includes('view'),
        canWrite: userPermissions.includes('create') || userPermissions.includes('edit'),
        canDelete: userPermissions.includes('delete'),
        canManage: userPermissions.includes('manage')
      }
    })

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
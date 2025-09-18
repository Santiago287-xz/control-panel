import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { userModulePermissions, organizationModules, modules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManage: true
      }))
      return NextResponse.json({ permissions })
    }

    // Regular users - get their specific permissions
    if (!session.user.organizationId) {
      return NextResponse.json({ permissions: [] })
    }

    const userPermissions = await db
      .select({
        moduleId: organizationModules.moduleId,
        canRead: userModulePermissions.canRead,
        canWrite: userModulePermissions.canWrite,
        canDelete: userModulePermissions.canDelete,
        canManage: userModulePermissions.canManage,
      })
      .from(userModulePermissions)
      .innerJoin(organizationModules, eq(userModulePermissions.organizationModuleId, organizationModules.id))
      .where(
        and(
          eq(userModulePermissions.userId, session.user.id),
          eq(organizationModules.organizationId, session.user.organizationId)
        )
      )

    return NextResponse.json({ permissions: userPermissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
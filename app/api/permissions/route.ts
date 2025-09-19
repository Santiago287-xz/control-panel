import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { organizationModules, modules } from '@/lib/db/schema'
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
        moduleName: module.name,
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManage: true
      }))
      return NextResponse.json({ permissions })
    }

    // Regular users - get org enabled modules with basic permissions
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

    // Dar permisos básicos por ahora, después implementa tu lógica dinámica
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
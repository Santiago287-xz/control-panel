// lib/modules/permissions.ts - SIN REGISTRY
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { organizationModules, modules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function checkModuleAccess(
  userId: string,
  organizationId: string,
  moduleName: string
): Promise<boolean> {
  try {
    const [orgModule] = await db
      .select()
      .from(organizationModules)
      .innerJoin(modules, eq(organizationModules.moduleId, modules.id))
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(modules.name, moduleName),
          eq(organizationModules.isEnabled, true)
        )
      )
      .limit(1)

    return !!orgModule
  } catch (error) {
    console.error('Error checking module access:', error)
    return false
  }
}

export async function getSessionWithPermissions() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  return {
    ...session,
    user: {
      ...session.user,
      canAccess: async (moduleName: string) => {
        if (session.user.isSuperAdmin) return true
        if (!session.user.organizationId) return false
        
        return await checkModuleAccess(
          session.user.id, 
          session.user.organizationId, 
          moduleName
        )
      }
    }
  }
}
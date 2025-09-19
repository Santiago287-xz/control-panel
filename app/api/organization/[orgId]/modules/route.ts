// app/api/organizations/[orgId]/modules/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { organizationModules, modules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgModules = await db
      .select({
        moduleId: organizationModules.moduleId,
        isEnabled: organizationModules.isEnabled,
        moduleName: modules.name,
        moduleDisplayName: modules.displayName
      })
      .from(organizationModules)
      .innerJoin(modules, eq(organizationModules.moduleId, modules.id))
      .where(eq(organizationModules.organizationId, orgId))

    return NextResponse.json({ modules: orgModules })
  } catch (error) {
    console.error('GET org modules error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { moduleIds } = await request.json()

    // Eliminar todas las asignaciones existentes
    await db
      .delete(organizationModules)
      .where(eq(organizationModules.organizationId, orgId))

    // Crear nuevas asignaciones
    if (moduleIds && moduleIds.length > 0) {
      const assignments = moduleIds.map((moduleId: string) => ({
        organizationId: orgId,
        moduleId,
        isEnabled: true
      }))

      await db.insert(organizationModules).values(assignments)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Asignados ${moduleIds?.length || 0} módulos` 
    })
  } catch (error) {
    console.error('PUT org modules error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
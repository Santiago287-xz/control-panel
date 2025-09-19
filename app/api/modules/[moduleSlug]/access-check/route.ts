// app/api/modules/[moduleSlug]/access-check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { modules, organizationModules, organizationModulePages, modulePages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleSlug: string }> }
) {
  try {
    const { moduleSlug } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Super admin tiene acceso total
    if (session.user.isSuperAdmin) {
      return NextResponse.json({
        hasAccess: true,
        canRead: true,
        canWrite: true,
        canDelete: true
      })
    }

    if (!session.user.organizationId) {
      return NextResponse.json({
        hasAccess: false,
        canRead: false,
        canWrite: false,
        canDelete: false
      })
    }

    // Verificar si la organización tiene acceso al módulo
    const moduleAccess = await db
      .select({
        moduleId: modules.id,
        isEnabled: organizationModules.isEnabled
      })
      .from(modules)
      .innerJoin(organizationModules, eq(organizationModules.moduleId, modules.id))
      .where(and(
        eq(modules.name, moduleSlug),
        eq(organizationModules.organizationId, session.user.organizationId),
        eq(organizationModules.isEnabled, true)
      ))
      .limit(1)

    if (!moduleAccess[0]) {
      return NextResponse.json({
        hasAccess: false,
        canRead: false,
        canWrite: false,
        canDelete: false
      })
    }

    // Por simplicidad, si tiene acceso al módulo, damos permisos básicos
    // En producción, verificarías permisos más granulares
    return NextResponse.json({
      hasAccess: true,
      canRead: true,
      canWrite: true,
      canDelete: false
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
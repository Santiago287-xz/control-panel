// app/api/modules/[moduleSlug]/pages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { modules, modulePages, organizationModulePages, userModulePagePermissions } from '@/lib/db/schema'
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

    // Buscar el módulo
    const [module] = await db
      .select()
      .from(modules)
      .where(eq(modules.name, moduleSlug))
      .limit(1)

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Si es super admin, devolver todas las páginas
    if (session.user.isSuperAdmin) {
      const allPages = await db
        .select({
          id: modulePages.id,
          name: modulePages.name,
          displayName: modulePages.displayName,
          routePath: modulePages.routePath,
          description: modulePages.description,
          icon: modulePages.icon,
          requiresId: modulePages.requiresId,
          sortOrder: modulePages.sortOrder,
          canRead: () => true,
          canWrite: () => true,
          canDelete: () => true,
        })
        .from(modulePages)
        .where(and(
          eq(modulePages.moduleId, module.id),
          eq(modulePages.isActive, true)
        ))

      return NextResponse.json({
        module,
        pages: allPages.map(page => ({
          ...page,
          canRead: true,
          canWrite: true,
          canDelete: true,
        }))
      })
    }

    // Para usuarios regulares, verificar permisos
    if (!session.user.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 403 })
    }

    // Obtener páginas con permisos
    const pagesWithPermissions = await db
      .select({
        id: modulePages.id,
        name: modulePages.name,
        displayName: modulePages.displayName,
        routePath: modulePages.routePath,
        description: modulePages.description,
        icon: modulePages.icon,
        requiresId: modulePages.requiresId,
        sortOrder: modulePages.sortOrder,
        orgCanRead: organizationModulePages.canRead,
        orgCanWrite: organizationModulePages.canWrite,
        orgCanDelete: organizationModulePages.canDelete,
        userCanRead: userModulePagePermissions.canRead,
        userCanWrite: userModulePagePermissions.canWrite,
        userCanDelete: userModulePagePermissions.canDelete,
      })
      .from(modulePages)
      .leftJoin(
        organizationModulePages,
        and(
          eq(organizationModulePages.modulePageId, modulePages.id),
          eq(organizationModulePages.organizationId, session.user.organizationId)
        )
      )
      .leftJoin(
        userModulePagePermissions,
        and(
          eq(userModulePagePermissions.modulePageId, modulePages.id),
          eq(userModulePagePermissions.userId, session.user.id)
        )
      )
      .where(and(
        eq(modulePages.moduleId, module.id),
        eq(modulePages.isActive, true)
      ))

    // Calcular permisos finales (user override organization)
    const pages = pagesWithPermissions.map(page => ({
      id: page.id,
      name: page.name,
      displayName: page.displayName,
      routePath: page.routePath,
      description: page.description,
      icon: page.icon,
      requiresId: page.requiresId,
      sortOrder: page.sortOrder,
      canRead: page.userCanRead !== null ? page.userCanRead : (page.orgCanRead || false),
      canWrite: page.userCanWrite !== null ? page.userCanWrite : (page.orgCanWrite || false),
      canDelete: page.userCanDelete !== null ? page.userCanDelete : (page.orgCanDelete || false),
    }))

    return NextResponse.json({ module, pages })
  } catch (error) {
    console.error('Error fetching module pages:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
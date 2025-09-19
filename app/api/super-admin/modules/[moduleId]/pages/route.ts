// app/api/super-admin/modules/[moduleId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { modules, organizationModules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar si el módulo tiene organizaciones asignadas
    const orgAssignments = await db
      .select()
      .from(organizationModules)
      .where(eq(organizationModules.moduleId, moduleId))

    if (orgAssignments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete module', 
        message: `Módulo tiene ${orgAssignments.length} organización(es) asignada(s). Remuévelas primero.` 
      }, { status: 400 })
    }

    // Eliminar módulo (cascade eliminará páginas y permisos)
    const [deletedModule] = await db
      .delete(modules)
      .where(eq(modules.id, moduleId))
      .returning()

    if (!deletedModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Módulo ${deletedModule.displayName} eliminado correctamente` 
    })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
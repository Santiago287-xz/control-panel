// app/api/super-admin/modules/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { modules, modulePages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener módulos con conteo de páginas
    const modulesList = await db.select().from(modules)
    const modulesWithPages = await Promise.all(
      modulesList.map(async (module) => {
        const [pageCount] = await db
          .select({ count: modulePages.id })
          .from(modulePages)
          .where(eq(modulePages.moduleId, module.id))
        
        return {
          ...module,
          pageCount: pageCount ? 1 : 0 // Simplificado, en producción usar COUNT()
        }
      })
    )

    return NextResponse.json({ modules: modulesWithPages })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
// app/api/super-admin/modules/register/route.ts - VERSION 1.1
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { adminDb } from '@/lib/db/tenant'
import { modules } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, displayName, description, category, icon } = await request.json()

    // Crear módulo (sin páginas, se crean dinámicamente al habilitar)
    const [newModule] = await adminDb.insert(modules).values({
      name,
      displayName,
      description,
      category,
      icon,
    }).returning()

    console.log(`✅ Módulo ${name} creado. Las tablas se crearán al habilitarlo en organizaciones.`)

    return NextResponse.json({ 
      module: newModule, 
      message: `Módulo ${displayName} creado correctamente`
    })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
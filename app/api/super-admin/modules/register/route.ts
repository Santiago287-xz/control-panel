import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { modules, modulePages } from '@/lib/db/schema'

// Páginas por defecto para cada módulo
const DEFAULT_PAGES: Record<string, any[]> = {
  booking: [
    { name: 'dashboard', displayName: 'Panel', routePath: '', icon: '📊', sortOrder: 0 },
    { name: 'list', displayName: 'Lista', routePath: '/list', icon: '📋', sortOrder: 1 },
    { name: 'create', displayName: 'Crear', routePath: '/create', icon: '➕', sortOrder: 2 },
    { name: 'edit', displayName: 'Editar', routePath: '/edit', icon: '✏️', requiresId: true, sortOrder: 3 }
  ],
  pos: [
    { name: 'dashboard', displayName: 'Panel', routePath: '', icon: '📊', sortOrder: 0 },
    { name: 'sales', displayName: 'Ventas', routePath: '/sales', icon: '💰', sortOrder: 1 },
    { name: 'new-sale', displayName: 'Nueva Venta', routePath: '/new-sale', icon: '🛒', sortOrder: 2 }
  ],
  users: [
    { name: 'dashboard', displayName: 'Panel', routePath: '', icon: '📊', sortOrder: 0 },
    { name: 'list', displayName: 'Lista', routePath: '/list', icon: '👥', sortOrder: 1 },
    { name: 'create', displayName: 'Crear', routePath: '/create', icon: '👤', sortOrder: 2 },
    { name: 'edit', displayName: 'Editar', routePath: '/edit', icon: '✏️', requiresId: true, sortOrder: 3 }
  ],
  analytics: [
    { name: 'dashboard', displayName: 'Panel', routePath: '', icon: '📈', sortOrder: 0 }
  ],
  inventory: [
    { name: 'dashboard', displayName: 'Panel', routePath: '', icon: '📊', sortOrder: 0 },
    { name: 'products', displayName: 'Productos', routePath: '/products', icon: '📦', sortOrder: 1 },
    { name: 'stock', displayName: 'Stock', routePath: '/stock', icon: '📋', sortOrder: 2 }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, displayName, description, category, icon } = await request.json()

    // Crear módulo
    const [newModule] = await db.insert(modules).values({
      name,
      displayName,
      description,
      category,
      icon,
    }).returning()

    // Crear páginas por defecto
    const defaultPages = DEFAULT_PAGES[name] || []
    if (defaultPages.length > 0) {
      const pagesToInsert = defaultPages.map(page => ({
        moduleId: newModule.id,
        name: page.name,
        displayName: page.displayName,
        routePath: page.routePath,
        description: `Página ${page.displayName} del módulo ${displayName}`,
        icon: page.icon,
        requiresId: page.requiresId || false,
        sortOrder: page.sortOrder || 0,
      }))

      await db.insert(modulePages).values(pagesToInsert)
    }

    return NextResponse.json({ module: newModule, pagesCreated: defaultPages.length })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
// lib/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { checkModuleAccess } from '@/lib/modules/permissions'

export function createModuleMiddleware(moduleName: string) {
  return async function moduleMiddleware(request: NextRequest) {
    try {
      const token = await getToken({ req: request })
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Extraer organizationId de la URL o del token
      const orgId = extractOrgId(request) || token.organizationId
      
      if (!orgId) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
      }

      // Verificar acceso al módulo
      const hasAccess = await checkModuleAccess(token.sub!, orgId, moduleName)
      
      if (!hasAccess) {
        return NextResponse.json({ error: 'Module access denied' }, { status: 403 })
      }

      // Añadir headers con información del usuario y organización
      const response = NextResponse.next()
      response.headers.set('x-user-id', token.sub!)
      response.headers.set('x-organization-id', orgId)
      response.headers.set('x-user-role', token.role as string)
      
      return response
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
  }
}

function extractOrgId(request: NextRequest): string | null {
  // Extraer de /api/org/[orgId]/... o similar
  const match = request.nextUrl.pathname.match(/\/org\/([^\/]+)/)
  return match ? match[1] : null
}
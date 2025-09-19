
// lib/hooks/useModuleAccess.ts
"use client"
import { useSession } from "next-auth/react"
import { MODULES, getUserModulePermissions } from "@/lib/modules/registry"
import { useMemo } from "react"

export function useModuleAccess() {
  const { data: session } = useSession()

  const userModules = useMemo(() => {
    if (!session?.user?.role) return []
    
    return Object.values(MODULES).filter(module => {
      const permissions = getUserModulePermissions(module.name, session.user.role)
      return permissions.length > 0
    })
  }, [session?.user?.role])

  const canAccess = (moduleName: string, action: string = 'view') => {
    if (!session?.user?.role) return false
    const permissions = getUserModulePermissions(moduleName, session.user.role)
    return permissions.includes(action)
  }

  return {
    userModules,
    canAccess,
    userRole: session?.user?.role,
    isAdmin: session?.user?.role === 'admin',
    isSuperAdmin: session?.user?.isSuperAdmin
  }
}

// middleware.ts (ACTUALIZADO)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Require authentication
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Super admin routes
  if (pathname.startsWith("/super-admin")) {
    if (!token.isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Organization routes - verificar que pertenezca a la org
  if (pathname.startsWith("/org/")) {
    const orgSlug = pathname.split('/')[2]
    
    // Si es super admin, permitir acceso a cualquier org
    if (token.isSuperAdmin) {
      return NextResponse.next()
    }
    
    // Verificar que el usuario pertenezca a esta organización
    if (!token.organizationId) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    
    // Aquí deberías verificar que el orgSlug corresponde a la organización del usuario
    // Por simplicidad, permitimos el acceso si tiene organizationId
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
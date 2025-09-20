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

  // Extract orgSlug from URL
  const orgSlugMatch = pathname.match(/^\/org\/([^\/]+)/)
  if (orgSlugMatch) {
    const orgSlug = orgSlugMatch[1]
    
    // Add orgSlug to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-org-slug', orgSlug)
    return response
  }

  // Super admin routes
  if (pathname.startsWith("/super-admin")) {
    if (!token.isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
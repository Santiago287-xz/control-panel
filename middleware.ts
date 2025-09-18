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

  // Organization routes
  if (pathname.startsWith("/org/")) {
    if (!token.organizationId) {
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
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { TokenService } from '@/lib/auth/tokens'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/auth/login', '/auth/register', '/api/auth']
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Verificar token en header Authorization
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.split(' ')[1] // Bearer <token>

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Verificar validez del token
  const payload = TokenService.verifyAccessToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Verificar rutas de super admin
  if (pathname.startsWith('/super-admin') && !payload.isSuperAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
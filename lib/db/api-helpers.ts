import { NextRequest } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { getTenantDb, adminDb } from './tenant'

export async function getSessionAndDb(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Super admin usa DB principal
  if (session.user.isSuperAdmin) {
    return { session, db: adminDb, isAdmin: true }
  }

  // Extraer orgSlug del header o URL
  const orgSlug = request.headers.get('x-org-slug') || 
                 extractOrgSlugFromUrl(request.url)
  
  if (!orgSlug) {
    throw new Error('Organization not found')
  }

  const tenantDb = getTenantDb(orgSlug)
  return { session, db: tenantDb, isAdmin: false, orgSlug }
}

function extractOrgSlugFromUrl(url: string): string | null {
  const match = url.match(/\/org\/([^\/]+)/)
  return match ? match[1] : null
}
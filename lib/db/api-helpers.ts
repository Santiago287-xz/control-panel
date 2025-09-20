import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { getTenantDb, adminDb } from './tenant'
import { organizations } from './schema'
import { eq } from 'drizzle-orm'

export async function getSessionAndDb() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Super admin usa DB principal
  if (session.user.isSuperAdmin) {
    return { session, db: adminDb, isAdmin: true }
  }

  // Para usuarios de organización, usar su organizationId para obtener el slug
  if (session.user.organizationId) {
    // Buscar la organización por ID para obtener el slug
    const [org] = await adminDb
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, session.user.organizationId))
      .limit(1)
    
    if (!org) {
      throw new Error('Organization not found')
    }

    const tenantDb = getTenantDb(org.slug)
    return { session, db: tenantDb, isAdmin: false, orgSlug: org.slug }
  }

  throw new Error('No organization found')
}
// lib/db/api-helpers.ts - HELPER SIMPLIFICADO
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { adminDb } from '@/lib/db/tenant'
import { organizations } from './schema'
import { eq, sql } from 'drizzle-orm'

export async function getSessionAndDb() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Super admin usa DB principal
  if (session.user.isSuperAdmin) {
    return { 
      session, 
      db: adminDb, 
      isAdmin: true,
      isTenant: false,
      orgSlug: null
    }
  }

  // Para usuarios de organización, usar adminDb con queries específicas de schema
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

    // Devolver adminDb con información del schema
    return { 
      session, 
      db: adminDb, 
      isAdmin: false, 
      isTenant: true,
      orgSlug: org.slug 
    }
  }

  throw new Error('No organization found')
}

// Helper para ejecutar queries en schema específico
export async function executeInSchema(orgSlug: string, query: any) {
  // Configurar search_path temporalmente
  await adminDb.execute(sql`SET search_path TO ${sql.identifier(orgSlug)}, public`)
  
  try {
    const result = await adminDb.execute(query)
    return result
  } finally {
    // Resetear search_path
    await adminDb.execute(sql`SET search_path TO public`)
  }
}

// Helper específico para verificar si user está en schema tenant
export async function getTenantSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId || session.user.isSuperAdmin) {
    throw new Error('Tenant access required')
  }

  const [org] = await adminDb
    .select({ slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, session.user.organizationId))
    .limit(1)
  
  if (!org) {
    throw new Error('Organization not found')
  }

  return {
    session,
    orgSlug: org.slug
  }
}

// Helper para verificar módulo habilitado
export async function checkModuleEnabled(orgId: string, moduleName: string) {
  const result = await adminDb.execute(sql`
    SELECT om.is_enabled 
    FROM organization_modules om
    JOIN modules m ON om.module_id = m.id
    WHERE om.organization_id = ${orgId} 
    AND m.name = ${moduleName} 
    AND om.is_enabled = true
  `)
  
  return result.rows.length > 0
}
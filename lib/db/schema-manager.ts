import { sql } from 'drizzle-orm'
import { adminDb } from './tenant'

export async function createTenantSchema(orgSlug: string) {
  try {
    // Crear esquema
    await adminDb.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(orgSlug)}`)
    
    // Aplicar todas las tablas al nuevo esquema
    await applySchemaToTenant(orgSlug)
    
    // Configurar RLS como backup
    await setupRLS(orgSlug)
    
    return { success: true }
  } catch (error) {
    console.error('Error creating tenant schema:', error)
    throw error
  }
}

async function applySchemaToTenant(orgSlug: string) {
  const migrations = [
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.organizations (LIKE public.organizations INCLUDING ALL)`,
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.users (LIKE public.users INCLUDING ALL)`,
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.modules (LIKE public.modules INCLUDING ALL)`,
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.module_pages (LIKE public.module_pages INCLUDING ALL)`,
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.organization_modules (LIKE public.organization_modules INCLUDING ALL)`,
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.organization_module_pages (LIKE public.organization_module_pages INCLUDING ALL)`,
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.user_module_page_permissions (LIKE public.user_module_page_permissions INCLUDING ALL)`,
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.module_data (LIKE public.module_data INCLUDING ALL)`,
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.audit_logs (LIKE public.audit_logs INCLUDING ALL)`,
  ]

  for (const migration of migrations) {
    await adminDb.execute(migration)
  }
}

async function setupRLS(orgSlug: string) {
  // RLS como red de seguridad
  const tables = ['users', 'module_data', 'audit_logs']
  
  for (const table of tables) {
    await adminDb.execute(sql`
      ALTER TABLE ${sql.identifier(orgSlug)}.${sql.identifier(table)} 
      ENABLE ROW LEVEL SECURITY
    `)
    
    await adminDb.execute(sql`
      CREATE POLICY ${sql.identifier(`${table}_tenant_isolation`)} 
      ON ${sql.identifier(orgSlug)}.${sql.identifier(table)}
      FOR ALL 
      USING (organization_id = current_setting('app.current_org_id', true)::uuid)
    `)
  }
}

export async function dropTenantSchema(orgSlug: string) {
  await adminDb.execute(sql`DROP SCHEMA IF EXISTS ${sql.identifier(orgSlug)} CASCADE`)
}
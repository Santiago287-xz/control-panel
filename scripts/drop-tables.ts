import { adminDb } from '../lib/db/tenant'
import { sql } from 'drizzle-orm'

async function dropTables() {
  console.log('🗑️ Eliminando esquemas y tablas...')
  
  try {
    // Eliminar esquemas de tenant primero
    await adminDb.execute(sql`DROP SCHEMA IF EXISTS "gimnasio-central" CASCADE`)
    await adminDb.execute(sql`DROP SCHEMA IF EXISTS "spa-wellness" CASCADE`)
    
    // Eliminar tablas del esquema público
    await adminDb.execute(sql`DROP TABLE IF EXISTS user_module_page_permissions CASCADE`)
    await adminDb.execute(sql`DROP TABLE IF EXISTS organization_module_pages CASCADE`)
    await adminDb.execute(sql`DROP TABLE IF EXISTS module_pages CASCADE`)
    await adminDb.execute(sql`DROP TABLE IF EXISTS audit_logs CASCADE`)
    await adminDb.execute(sql`DROP TABLE IF EXISTS module_data CASCADE`)
    await adminDb.execute(sql`DROP TABLE IF EXISTS organization_modules CASCADE`)
    await adminDb.execute(sql`DROP TABLE IF EXISTS super_admins CASCADE`)
    await adminDb.execute(sql`DROP TABLE IF EXISTS users CASCADE`)
    await adminDb.execute(sql`DROP TABLE IF EXISTS modules CASCADE`)
    await adminDb.execute(sql`DROP TABLE IF EXISTS organizations CASCADE`)
    
    console.log('✅ Todo eliminado')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

dropTables().then(() => process.exit(0))
import { adminDb } from '../lib/db/tenant'
import { sql } from 'drizzle-orm'

async function dropTables() {
  console.log('🗑️ Eliminando esquemas y tablas...')
  
  try {
    // 1. PRIMERO eliminar esquemas tenant COMPLETAMENTE
    await adminDb.execute(sql`DROP SCHEMA IF EXISTS "gimnasio-central" CASCADE`)
    await adminDb.execute(sql`DROP SCHEMA IF EXISTS "spa-wellness" CASCADE`)
    console.log('✅ Esquemas tenant eliminados')
    
    // 2. Luego eliminar tablas del esquema público
    const tables = [
      'user_module_page_permissions',
      'organization_module_pages', 
      'module_pages',
      'audit_logs',
      'module_data',
      'organization_modules',
      'super_admins',
      'users',
      'modules', 
      'organizations'
    ]
    
    for (const table of tables) {
      await adminDb.execute(sql`DROP TABLE IF EXISTS ${sql.identifier(table)} CASCADE`)
    }
    
    console.log('✅ Tablas públicas eliminadas')
    console.log('✅ Todo eliminado')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

dropTables().then(() => process.exit(0))
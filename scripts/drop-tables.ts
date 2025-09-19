// scripts/drop-tables.ts
import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function dropTables() {
  console.log('🗑️ Eliminando todas las tablas...')
  
  try {
    // Eliminar en orden correcto (foreign keys primero)
    await db.execute(sql`DROP TABLE IF EXISTS user_module_page_permissions CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS organization_module_pages CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS module_pages CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS audit_logs CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS module_data CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS organization_modules CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS super_admins CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS modules CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS organizations CASCADE`)
    
    console.log('✅ Todas las tablas eliminadas')
  } catch (error) {
    console.error('❌ Error eliminando tablas:', error)
    process.exit(1)
  }
}

dropTables().then(() => process.exit(0))
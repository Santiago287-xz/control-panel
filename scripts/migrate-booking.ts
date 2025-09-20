// scripts/migrate-booking.ts
import { adminDb, getTenantDb } from '../lib/db/tenant'
import { createBookingTables } from '../lib/db/booking-tables'
import { sql } from 'drizzle-orm'

async function migrateBooking() {
  console.log('🔄 Iniciando migración de booking...')
  
  try {
    // Obtener todas las organizaciones
    const orgsResult = await adminDb.execute(sql`
      SELECT id, slug FROM organizations WHERE is_active = true
    `)
    
    if (!orgsResult.rows.length) {
      console.log('❌ No hay organizaciones activas')
      return
    }

    for (const org of orgsResult.rows) {
      const orgId = org.id as string
      const orgSlug = org.slug as string
      
      console.log(`📦 Migrando ${orgSlug}...`)
      
      // Obtener conexión al tenant
      const tenantDb = getTenantDb(orgSlug)
      
      // Crear tablas de booking
      await createBookingTables(tenantDb, orgId)
    }
    
    console.log('✅ Migración de booking completada')
  } catch (error) {
    console.error('❌ Error en migración:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  migrateBooking().then(() => process.exit(0))
}

export { migrateBooking }
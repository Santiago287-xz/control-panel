import { adminDb, getTenantDb, createTenantSchema } from '@/lib/db/tenant'
import { organizations, users } from '@/lib/db/schema'

async function migrateExistingOrganizations() {
  console.log('🔄 Migrando organizaciones existentes...')
  
  try {
    // Obtener organizaciones existentes
    const existingOrgs = await adminDb.select().from(organizations)
    
    for (const org of existingOrgs) {
      console.log(`📦 Migrando: ${org.name} (${org.slug})`)
      
      // Crear esquema para la organización
      await createTenantSchema(org.slug)
      
      // Migrar datos específicos de la organización si existen
      // (aquí irían las migraciones de datos específicos como courts, reservations, etc.)
      
      console.log(`✅ Migrado: ${org.name}`)
    }
    
    console.log('🎉 Migración completada')
  } catch (error) {
    console.error('❌ Error en migración:', error)
  }
}

if (require.main === module) {
  migrateExistingOrganizations().then(() => process.exit(0))
}
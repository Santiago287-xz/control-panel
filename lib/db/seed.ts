// lib/db/seed.ts - ACTUALIZADO PARA ESQUEMA SIMPLIFICADO
import { adminDb, getTenantDb } from './tenant'
import { createTenantSchema } from './schema-manager'
import { createBookingTables } from './booking-tables'
import { modules, users, superAdmins, organizations, organizationModules } from './schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function seed() {
  console.log('🌱 Iniciando seed completo...')

  try {
    // 1. Crear módulo booking
    console.log('📦 Creando módulo booking...')
    let bookingModule = await adminDb.select().from(modules).where(eq(modules.name, 'booking')).limit(1)
    
    if (bookingModule.length === 0) {
      const [newModule] = await adminDb.insert(modules).values({
        name: 'booking',
        displayName: 'Reservas',
        description: 'Gestión de reservas y horarios',
        icon: '📅',
        category: 'business'
      }).returning()
      bookingModule = [newModule]
    }

    const moduleId = bookingModule[0].id

    // 2. Crear Super Admin
    console.log('👤 Creando Super Admin...')
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    
    let superAdminUser = await adminDb.select().from(users).where(eq(users.email, 'admin@admin.com')).limit(1)
    
    if (superAdminUser.length === 0) {
      const [newUser] = await adminDb.insert(users).values({
        email: 'admin@admin.com',
        name: 'Super Admin',
        hashedPassword,
        role: 'super_admin'
      }).returning()
      superAdminUser = [newUser]

      await adminDb.insert(superAdmins).values({
        userId: superAdminUser[0].id,
      }).onConflictDoNothing()
    }

    // 3. Crear organizaciones
    console.log('🏢 Creando organizaciones...')
    let gymOrg = await adminDb.select().from(organizations).where(eq(organizations.slug, 'gimnasio-central')).limit(1)
    let spaOrg = await adminDb.select().from(organizations).where(eq(organizations.slug, 'spa-wellness')).limit(1)

    if (gymOrg.length === 0) {
      const [newGym] = await adminDb.insert(organizations).values({
        name: 'Gimnasio Central',
        slug: 'gimnasio-central',
        type: 'gym',
        settings: { timezone: 'America/Argentina/Buenos_Aires' }
      }).returning()
      gymOrg = [newGym]
    }

    if (spaOrg.length === 0) {
      const [newSpa] = await adminDb.insert(organizations).values({
        name: 'Spa Wellness',
        slug: 'spa-wellness', 
        type: 'spa',
        settings: { timezone: 'America/Argentina/Buenos_Aires' }
      }).returning()
      spaOrg = [newSpa]
    }

    // 4. Crear esquemas para organizaciones
    console.log('🔧 Creando esquemas de tenant...')
    await createTenantSchema('gimnasio-central')
    await createTenantSchema('spa-wellness')

    // 5. Crear admins de organizaciones
    console.log('👥 Creando admins de organizaciones...')
    await adminDb.insert(users).values([
      {
        email: 'admin@gimnasio-central.com',
        name: 'Admin Gimnasio',
        hashedPassword,
        organizationId: gymOrg[0].id,
        role: 'admin'
      },
      {
        email: 'admin@spa-wellness.com',
        name: 'Admin Spa',
        hashedPassword,
        organizationId: spaOrg[0].id,
        role: 'admin'
      }
    ]).onConflictDoNothing()

    // 6. Asignar módulo booking al gimnasio
    console.log('🔗 Asignando módulo al gimnasio...')
    await adminDb.insert(organizationModules).values({
      organizationId: gymOrg[0].id,
      moduleId: moduleId,
      isEnabled: true
    }).onConflictDoNothing()

    // 7. Crear tablas de booking en esquemas tenant
    console.log('🏗️ Creando tablas de booking...')
    const gymTenantDb = getTenantDb('gimnasio-central')
    await createBookingTables(gymTenantDb, gymOrg[0].id)

    console.log('✅ Seed completado!')
    console.log('\n📋 Credenciales:')
    console.log('🔹 Super Admin: admin@admin.com / admin123')
    console.log('🔹 Gimnasio: admin@gimnasio-central.com / admin123')
    console.log('🔹 Spa: admin@spa-wellness.com / admin123')

  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0))
}

export { seed }
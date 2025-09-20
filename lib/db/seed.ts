import { adminDb, getTenantDb } from './tenant'
import { createTenantSchema } from './schema-manager'
import { modules, modulePages, users, superAdmins, organizations, organizationModules, organizationModulePages } from './schema'
import bcrypt from 'bcryptjs'
import { sql, eq } from 'drizzle-orm'

async function seed() {
  console.log('🌱 Iniciando seed completo con booking...')

  try {
    // 1. Crear o buscar módulo booking
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

    // 2. Crear páginas del módulo booking
    console.log('📄 Creando páginas del módulo booking...')
    const pageData = [
      { moduleId, name: 'dashboard', displayName: 'Panel', routePath: '', description: 'Dashboard principal', icon: '📊', requiresId: false, sortOrder: 0 },
      { moduleId, name: 'calendar', displayName: 'Calendario', routePath: '/calendar', description: 'Vista de calendario', icon: '📅', requiresId: false, sortOrder: 1 },
      { moduleId, name: 'courts', displayName: 'Canchas', routePath: '/courts', description: 'Gestión de canchas', icon: '🏟️', requiresId: false, sortOrder: 2 },
      { moduleId, name: 'reservations', displayName: 'Reservas', routePath: '/reservations', description: 'Lista de reservas', icon: '📋', requiresId: false, sortOrder: 3 }
    ]

    const bookingPages = await adminDb.insert(modulePages).values(pageData).onConflictDoNothing().returning()

    // 3. Crear Super Admin
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

    // 4. Crear organizaciones
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

    // 5. Crear esquemas para organizaciones
    console.log('🔧 Creando esquemas de tenant...')
    await createTenantSchema('gimnasio-central')
    await createTenantSchema('spa-wellness')

    // 6. Crear admins de organizaciones
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

    // 7. Asignar módulo booking al gimnasio
    console.log('🔗 Asignando módulo al gimnasio...')
    await adminDb.insert(organizationModules).values({
      organizationId: gymOrg[0].id,
      moduleId: moduleId,
      isEnabled: true
    }).onConflictDoNothing()

    // 8. Asignar permisos de páginas al gimnasio (solo si hay páginas)
    if (bookingPages.length > 0) {
      console.log('🔐 Asignando permisos de páginas...')
      for (const page of bookingPages) {
        await adminDb.insert(organizationModulePages).values({
          organizationId: gymOrg[0].id,
          modulePageId: page.id,
          canRead: true,
          canWrite: true,
          canDelete: true,
          grantedBy: superAdminUser[0].id,
        }).onConflictDoNothing()
      }
    }

    // 9. Crear tablas de booking en esquema del gimnasio
    console.log('🏗️ Creando tablas de booking en gimnasio...')
    await createBookingTables('gimnasio-central', gymOrg[0].id)
    
    // 10. Insertar datos de prueba en gimnasio
    console.log('📊 Insertando datos de prueba...')
    await seedBookingData('gimnasio-central', gymOrg[0].id)

    console.log('✅ Seed completado!')
    console.log('\n📋 Credenciales:')
    console.log('🔹 Super Admin: admin@admin.com / admin123')
    console.log('🔹 Gimnasio (CON booking): admin@gimnasio-central.com / admin123')
    console.log('🔹 Spa (SIN módulos): admin@spa-wellness.com / admin123')
    console.log('\n📊 Estadísticas:')
    console.log('🔹 Módulos: 1 (booking)')
    console.log('🔹 Organizaciones: 2')
    console.log('🔹 Gimnasio tiene acceso a booking con datos de prueba')
    console.log('🔹 Spa NO tiene módulos asignados')

  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

async function createBookingTables(orgSlug: string, orgId: string) {
  const tenantDb = getTenantDb(orgSlug)
  
  await tenantDb.execute(sql`
    CREATE TABLE IF NOT EXISTS courts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      type text NOT NULL,
      organization_id uuid NOT NULL,
      is_active boolean DEFAULT true,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `)

  await tenantDb.execute(sql`
    CREATE TABLE IF NOT EXISTS court_reservations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      court_id uuid NOT NULL,
      name text,
      phone text,
      start_time timestamp NOT NULL,
      end_time timestamp NOT NULL,
      status text DEFAULT 'confirmed',
      payment_method text DEFAULT 'pending',
      is_recurring boolean DEFAULT false,
      recurrence_end timestamp,
      paid_sessions integer,
      last_payment_date timestamp,
      payment_notes text,
      current_account_id uuid,
      organization_id uuid NOT NULL,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `)

  await tenantDb.execute(sql`
    CREATE TABLE IF NOT EXISTS events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      date timestamp NOT NULL,
      start_time timestamp NOT NULL,
      end_time timestamp NOT NULL,
      court_ids uuid[] NOT NULL,
      organization_id uuid NOT NULL,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `)
}

async function seedBookingData(orgSlug: string, orgId: string) {
  const tenantDb = getTenantDb(orgSlug)
  
  await tenantDb.execute(sql`
    INSERT INTO courts (name, type, organization_id) VALUES 
    ('Cancha Fútbol 1', 'futbol', ${orgId}),
    ('Cancha Fútbol 2', 'futbol', ${orgId}),
    ('Cancha Pádel 1', 'padel', ${orgId}),
    ('Cancha Pádel 2', 'padel', ${orgId})
    ON CONFLICT DO NOTHING
  `)

  const courts = await tenantDb.execute(sql`SELECT id, name, type FROM courts WHERE organization_id = ${orgId}`)
  
  if (courts.rows.length > 0) {
    const futbolCourt = courts.rows.find(c => c.type === 'futbol')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (futbolCourt) {
      await tenantDb.execute(sql`
        INSERT INTO court_reservations (
          court_id, name, phone, start_time, end_time, 
          status, payment_method, organization_id
        ) VALUES (
          ${futbolCourt.id}, 
          'Juan Pérez', 
          '1234567890',
          ${new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0)},
          ${new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0)},
          'confirmed',
          'cash',
          ${orgId}
        )
        ON CONFLICT DO NOTHING
      `)
    }
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0))
}

export { seed }
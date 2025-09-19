// lib/db/seed.ts - SIMPLIFIED
import { db } from './index'
import { modules, modulePages, users, superAdmins, organizations, organizationModules, organizationModulePages } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Iniciando seed simplificado...')

  try {
    // 1. Crear solo módulo booking
    console.log('📦 Creando módulo booking...')
    const [bookingModule] = await db.insert(modules).values({
      name: 'booking',
      displayName: 'Reservas',
      description: 'Gestión de reservas y horarios',
      icon: '📅',
      category: 'business'
    }).onConflictDoNothing().returning()

    // 2. Crear páginas del módulo booking
    console.log('📄 Creando páginas del módulo booking...')
    const pageData = [
      { moduleId: bookingModule.id, name: 'dashboard', displayName: 'Panel', routePath: '', description: 'Dashboard principal', icon: '📊', requiresId: false, sortOrder: 0 },
      { moduleId: bookingModule.id, name: 'list', displayName: 'Lista', routePath: '/list', description: 'Lista de reservas', icon: '📋', requiresId: false, sortOrder: 1 },
      { moduleId: bookingModule.id, name: 'create', displayName: 'Crear', routePath: '/create', description: 'Nueva reserva', icon: '➕', requiresId: false, sortOrder: 2 },
      { moduleId: bookingModule.id, name: 'edit', displayName: 'Editar', routePath: '/edit', description: 'Editar reserva', icon: '✏️', requiresId: true, sortOrder: 3 }
    ]

    const bookingPages = await db.insert(modulePages).values(pageData).onConflictDoNothing().returning()

    // 3. Crear dos organizaciones
    console.log('🏢 Creando organizaciones...')
    const [gymOrg, spaOrg] = await db.insert(organizations).values([
      {
        name: 'Gimnasio Central',
        slug: 'gimnasio-central',
        type: 'gym',
        settings: { timezone: 'America/Argentina/Buenos_Aires' }
      },
      {
        name: 'Spa Wellness',
        slug: 'spa-wellness', 
        type: 'spa',
        settings: { timezone: 'America/Argentina/Buenos_Aires' }
      }
    ]).onConflictDoNothing().returning()

    // 4. Crear Super Admin
    console.log('👤 Creando Super Admin...')
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    
    const [superAdminUser] = await db.insert(users).values({
      email: 'admin@admin.com',
      name: 'Super Admin',
      hashedPassword,
      role: 'super_admin'
    }).onConflictDoNothing().returning()

    await db.insert(superAdmins).values({
      userId: superAdminUser.id,
    }).onConflictDoNothing()

    // 5. Crear admins para cada organización
    console.log('👥 Creando admins de organizaciones...')
    
    const [gymAdmin] = await db.insert(users).values({
      email: 'admin@gimnasio-central.com',
      name: 'Admin Gimnasio',
      hashedPassword,
      organizationId: gymOrg.id,
      role: 'admin'
    }).onConflictDoNothing().returning()

    const [spaAdmin] = await db.insert(users).values({
      email: 'admin@spa-wellness.com',
      name: 'Admin Spa',
      hashedPassword,
      organizationId: spaOrg.id,
      role: 'admin'
    }).onConflictDoNothing().returning()

    // 6. Asignar módulo booking solo al gimnasio (spa sin módulos)
    console.log('🔗 Asignando módulo al gimnasio...')
    await db.insert(organizationModules).values({
      organizationId: gymOrg.id,
      moduleId: bookingModule.id,
      isEnabled: true
    }).onConflictDoNothing()

    // 7. Asignar permisos de páginas al gimnasio
    console.log('🔐 Asignando permisos de páginas...')
    for (const page of bookingPages) {
      await db.insert(organizationModulePages).values({
        organizationId: gymOrg.id,
        modulePageId: page.id,
        canRead: true,
        canWrite: true,
        canDelete: true,
        grantedBy: superAdminUser.id,
      }).onConflictDoNothing()
    }

    console.log('✅ Seed simplificado completado!')
    console.log('\n📋 Credenciales:')
    console.log('🔹 Super Admin: admin@admin.com / admin123')
    console.log('🔹 Gimnasio (CON booking): admin@gimnasio-central.com / admin123')
    console.log('🔹 Spa (SIN módulos): admin@spa-wellness.com / admin123')
    console.log('\n📊 Estadísticas:')
    console.log('🔹 Módulos: 1 (booking)')
    console.log('🔹 Organizaciones: 2')
    console.log('🔹 Gimnasio tiene acceso a booking')
    console.log('🔹 Spa NO tiene módulos asignados')

  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0))
}

export { seed }
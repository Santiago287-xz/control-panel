// lib/db/seed.ts - ACTUALIZADO
import { db } from './index'
import { modules, modulePages, users, superAdmins, organizations, organizationModules, organizationModulePages } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Iniciando seed...')

  try {
    // 1. Crear módulos del sistema
    console.log('📦 Creando módulos...')
    const moduleData = [
      {
        name: 'booking',
        displayName: 'Reservas',
        description: 'Gestión de reservas y horarios',
        icon: 'Calendar',
        category: 'business'
      },
      {
        name: 'pos',
        displayName: 'Punto de Venta',
        description: 'Sistema de ventas y facturación',
        icon: 'CreditCard',
        category: 'business'
      },
      {
        name: 'users',
        displayName: 'Gestión de Usuarios',
        description: 'Administrar usuarios y clientes',
        icon: 'Users',
        category: 'core'
      },
      {
        name: 'analytics',
        displayName: 'Análisis',
        description: 'Reportes y estadísticas',
        icon: 'BarChart',
        category: 'analytics'
      }
    ]

    const insertedModules = await db.insert(modules).values(moduleData).onConflictDoNothing().returning()

    // 2. Crear páginas para cada módulo
    console.log('📄 Creando páginas de módulos...')
    
    // Obtener todos los módulos
    const allModules = await db.select().from(modules)
    
    const pageData = []
    
    // Booking pages
    const bookingModule = allModules.find(m => m.name === 'booking')
    if (bookingModule) {
      pageData.push(
        { moduleId: bookingModule.id, name: 'dashboard', displayName: 'Panel', routePath: '', description: 'Dashboard principal', icon: '📊', requiresId: false, sortOrder: 0 },
        { moduleId: bookingModule.id, name: 'list', displayName: 'Lista', routePath: '/list', description: 'Lista de reservas', icon: '📋', requiresId: false, sortOrder: 1 },
        { moduleId: bookingModule.id, name: 'create', displayName: 'Crear', routePath: '/create', description: 'Nueva reserva', icon: '➕', requiresId: false, sortOrder: 2 },
        { moduleId: bookingModule.id, name: 'edit', displayName: 'Editar', routePath: '/edit', description: 'Editar reserva', icon: '✏️', requiresId: true, sortOrder: 3 }
      )
    }

    // POS pages
    const posModule = allModules.find(m => m.name === 'pos')
    if (posModule) {
      pageData.push(
        { moduleId: posModule.id, name: 'dashboard', displayName: 'Panel', routePath: '', description: 'Dashboard de ventas', icon: '📊', requiresId: false, sortOrder: 0 },
        { moduleId: posModule.id, name: 'sales', displayName: 'Ventas', routePath: '/sales', description: 'Historial de ventas', icon: '💰', requiresId: false, sortOrder: 1 },
        { moduleId: posModule.id, name: 'new-sale', displayName: 'Nueva Venta', routePath: '/new-sale', description: 'Realizar venta', icon: '🛒', requiresId: false, sortOrder: 2 }
      )
    }

    // Users pages
    const usersModule = allModules.find(m => m.name === 'users')
    if (usersModule) {
      pageData.push(
        { moduleId: usersModule.id, name: 'dashboard', displayName: 'Panel', routePath: '', description: 'Dashboard de usuarios', icon: '📊', requiresId: false, sortOrder: 0 },
        { moduleId: usersModule.id, name: 'list', displayName: 'Lista', routePath: '/list', description: 'Lista de usuarios', icon: '👥', requiresId: false, sortOrder: 1 },
        { moduleId: usersModule.id, name: 'create', displayName: 'Crear', routePath: '/create', description: 'Nuevo usuario', icon: '👤', requiresId: false, sortOrder: 2 },
        { moduleId: usersModule.id, name: 'edit', displayName: 'Editar', routePath: '/edit', description: 'Editar usuario', icon: '✏️', requiresId: true, sortOrder: 3 }
      )
    }

    // Analytics pages
    const analyticsModule = allModules.find(m => m.name === 'analytics')
    if (analyticsModule) {
      pageData.push(
        { moduleId: analyticsModule.id, name: 'dashboard', displayName: 'Panel', routePath: '', description: 'Dashboard de análisis', icon: '📈', requiresId: false, sortOrder: 0 }
      )
    }

    await db.insert(modulePages).values(pageData).onConflictDoNothing()

    // 3. Crear organizaciones
    console.log('🏢 Creando organizaciones...')
    const [gymOrg] = await db.insert(organizations).values({
      name: 'Gimnasio Demo',
      slug: 'gimnasio-demo',
      type: 'gym',
      settings: { timezone: 'America/Argentina/Buenos_Aires' }
    }).onConflictDoNothing().returning()

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

    // 5. Crear usuarios de organizaciones
    console.log('👥 Creando usuarios de organizaciones...')
    
    const [gymAdmin] = await db.insert(users).values({
      email: 'admin@gimnasio-demo.com',
      name: 'Admin Gimnasio',
      hashedPassword,
      organizationId: gymOrg.id,
      role: 'admin'
    }).onConflictDoNothing().returning()

    await db.insert(users).values([
      {
        email: 'recepcion@gimnasio-demo.com',
        name: 'Recepcionista',
        hashedPassword,
        organizationId: gymOrg.id,
        role: 'reception'
      }
    ]).onConflictDoNothing()

    // 6. Asignar módulos a organizaciones (mantener compatibilidad)
    console.log('🔗 Asignando módulos...')
    for (const module of allModules) {
      await db.insert(organizationModules).values({
        organizationId: gymOrg.id,
        moduleId: module.id
      }).onConflictDoNothing()
    }

    // 7. Asignar permisos granulares de páginas
    console.log('🔐 Asignando permisos de páginas...')
    const allPages = await db.select().from(modulePages)
    
    // Dar todos los permisos a la organización demo
    for (const page of allPages) {
      await db.insert(organizationModulePages).values({
        organizationId: gymOrg.id,
        modulePageId: page.id,
        canRead: true,
        canWrite: true,
        canDelete: true,
        grantedBy: superAdminUser.id,
      }).onConflictDoNothing()
    }

    console.log('✅ Seed completado!')
    console.log('\n📋 Credenciales:')
    console.log('🔹 Super Admin: admin@admin.com / admin123')
    console.log('🔹 Gym Admin: admin@gimnasio-demo.com / admin123')
    console.log('🔹 Gym Reception: recepcion@gimnasio-demo.com / admin123')
    console.log('\n📊 Estadísticas:')
    console.log(`🔹 Módulos creados: ${allModules.length}`)
    console.log(`🔹 Páginas creadas: ${allPages.length}`)

  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0))
}

export { seed }
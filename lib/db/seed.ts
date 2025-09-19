// lib/db/seed.ts
import { db } from './index'
import { modules, users, superAdmins, organizations, organizationModules } from './schema'
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
      },
      {
        name: 'current-accounts',
        displayName: 'Cuentas Corrientes',
        description: 'Gestión de cuentas y pagos',
        icon: 'DollarSign',
        category: 'business'
      }
    ]

    await db.insert(modules).values(moduleData).onConflictDoNothing()

    // 2. Crear organizaciones
    console.log('🏢 Creando organizaciones...')
    const [gymOrg] = await db.insert(organizations).values({
      name: 'Gimnasio Demo',
      slug: 'gimnasio-demo',
      type: 'gym',
      settings: { timezone: 'America/Argentina/Buenos_Aires' }
    }).returning()

    const [restaurantOrg] = await db.insert(organizations).values({
      name: 'Restaurante Demo',
      slug: 'restaurante-demo', 
      type: 'restaurant',
      settings: { timezone: 'America/Argentina/Buenos_Aires' }
    }).returning()

    // 3. Crear Super Admin
    console.log('👤 Creando Super Admin...')
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    
    const [superAdminUser] = await db.insert(users).values({
      email: 'admin@admin.com',
      name: 'Super Admin',
      hashedPassword,
      role: 'super_admin'
    }).returning()

    await db.insert(superAdmins).values({
      userId: superAdminUser.id,
      level: 3
    })

    // 4. Crear usuarios de organizaciones
    console.log('👥 Creando usuarios de organizaciones...')
    
    // Gimnasio
    const [gymAdmin] = await db.insert(users).values({
      email: 'admin@gimnasio-demo.com',
      name: 'Admin Gimnasio',
      hashedPassword,
      organizationId: gymOrg.id,
      role: 'admin'
    }).returning()

    await db.insert(users).values([
      {
        email: 'recepcion@gimnasio-demo.com',
        name: 'Recepcionista',
        hashedPassword,
        organizationId: gymOrg.id,
        role: 'reception'
      },
      {
        email: 'manager@gimnasio-demo.com',
        name: 'Manager Canchas',
        hashedPassword,
        organizationId: gymOrg.id,
        role: 'court_manager'
      }
    ])

    // Restaurante
    await db.insert(users).values([
      {
        email: 'admin@restaurante-demo.com',
        name: 'Admin Restaurante',
        hashedPassword,
        organizationId: restaurantOrg.id,
        role: 'admin'
      },
      {
        email: 'cajero@restaurante-demo.com',
        name: 'Cajero',
        hashedPassword,
        organizationId: restaurantOrg.id,
        role: 'cashier'
      }
    ])

    // 5. Asignar módulos a organizaciones
    console.log('🔗 Asignando módulos...')
    const allModules = await db.select().from(modules)
    
    // Gimnasio: todos los módulos
    for (const module of allModules) {
      await db.insert(organizationModules).values({
        organizationId: gymOrg.id,
        moduleId: module.id
      }).onConflictDoNothing()
    }

    // Restaurante: solo POS y usuarios
    const restaurantModules = allModules.filter(m => ['pos', 'users', 'analytics'].includes(m.name))
    for (const module of restaurantModules) {
      await db.insert(organizationModules).values({
        organizationId: restaurantOrg.id,
        moduleId: module.id
      }).onConflictDoNothing()
    }

    console.log('✅ Seed completado!')
    console.log('\n📋 Credenciales:')
    console.log('🔹 Super Admin: admin@admin.com / admin123')
    console.log('🔹 Gym Admin: admin@gimnasio-demo.com / admin123')
    console.log('🔹 Gym Reception: recepcion@gimnasio-demo.com / admin123')
    console.log('🔹 Restaurant Admin: admin@restaurante-demo.com / admin123')

  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0))
}

export { seed }
import { db } from './index'
import { modules, users, superAdmins, organizations } from './schema'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

// Cargar múltiples archivos .env
config({ path: '.env.local' })
config({ path: '.env' })

// Debug de variables de entorno
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL)

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...')

  try {
    // 1. Crear módulos básicos del sistema
    console.log('📦 Creando módulos básicos...')
    
    const moduleData = [
      {
        name: 'user_management',
        displayName: 'Gestión de Usuarios',
        description: 'Administrar usuarios y permisos',
        icon: 'Users',
        category: 'core'
      },
      {
        name: 'dashboard',
        displayName: 'Dashboard',
        description: 'Panel principal con métricas',
        icon: 'BarChart3',
        category: 'core'
      },
      {
        name: 'sales',
        displayName: 'Ventas',
        description: 'Gestión de ventas y facturación',
        icon: 'ShoppingCart',
        category: 'business'
      },
      {
        name: 'inventory',
        displayName: 'Inventario',
        description: 'Control de stock y productos',
        icon: 'Package',
        category: 'business'
      },
      {
        name: 'reports',
        displayName: 'Reportes',
        description: 'Análisis y reportes avanzados',
        icon: 'FileText',
        category: 'analytics'
      },
      {
        name: 'settings',
        displayName: 'Configuración',
        description: 'Configuración del sistema',
        icon: 'Settings',
        category: 'core'
      }
    ]

    await db.insert(modules).values(moduleData).onConflictDoNothing()

    // 2. Crear organización de ejemplo
    console.log('🏢 Creando organización de ejemplo...')
    
    const [organization] = await db.insert(organizations).values({
      name: 'Gimnasio Demo',
      slug: 'gimnasio-demo',
      type: 'gym',
      settings: {
        theme: 'default',
        timezone: 'America/Argentina/Buenos_Aires',
        features: ['memberships', 'classes', 'trainers']
      }
    }).returning()

    // 3. Crear Super Administrador
    console.log('👤 Creando Super Administrador...')
    
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    
    const [superAdminUser] = await db.insert(users).values({
      email: 'admin@admin.com',
      name: 'Super Admin',
      hashedPassword,
      isActive: true
    }).returning()

    await db.insert(superAdmins).values({
      userId: superAdminUser.id,
      level: 3, // Root level
      twoFactorEnabled: false
    })

    // 4. Crear usuario administrador de organización
    console.log('👥 Creando administrador de organización...')
    
    const [orgAdminUser] = await db.insert(users).values({
      email: 'admin@gimnasio-demo.com',
      name: 'Admin Gimnasio',
      hashedPassword,
      organizationId: organization.id,
      isOrgAdmin: true,
      isActive: true
    }).returning()

    console.log('✅ Seed completado exitosamente!')
    console.log('\n📋 Credenciales creadas:')
    console.log('🔹 Super Admin: admin@admin.com / admin123')
    console.log('🔹 Org Admin: admin@gimnasio-demo.com / admin123')
    console.log('\n🚀 Puedes iniciar el servidor con: npm run dev')

  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    process.exit(1)
  }
}

// Ejecutar seed si es llamado directamente
if (require.main === module) {
  seed().then(() => process.exit(0))
}

export { seed }
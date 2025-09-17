import { db } from './index'
import { organizations, users, superAdmins, modules } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Seeding database...')

  // Crear módulos base
  const coreModules = [
    {
      name: 'user_management',
      displayName: 'Gestión de Usuarios',
      description: 'Administrar usuarios y permisos',
      category: 'core',
      icon: 'Users'
    },
    {
      name: 'dashboard',
      displayName: 'Dashboard',
      description: 'Panel de control principal',
      category: 'core',
      icon: 'BarChart3'
    },
    {
      name: 'settings',
      displayName: 'Configuración',
      description: 'Configuración del sistema',
      category: 'core',
      icon: 'Settings'
    }
  ]

  await db.insert(modules).values(coreModules)

  // Crear super admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const [superUser] = await db.insert(users).values({
    email: 'admin@example.com',
    name: 'Super Admin',
    hashedPassword,
  }).returning()

  await db.insert(superAdmins).values({
    userId: superUser.id,
    level: 3, // Root level
  })

  console.log('✅ Database seeded successfully!')
  console.log('Super Admin created:')
  console.log('Email: admin@example.com')
  console.log('Password: admin123')
}

seed().catch(console.error)
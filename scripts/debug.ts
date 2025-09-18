// scripts/debug.ts
import { db } from '../lib/db'
import { users, superAdmins, organizations, modules, organizationModules } from '../lib/db/schema'

async function debug() {
  console.log('🔍 DEBUGGING DATABASE...\n')

  // Usuarios
  const allUsers = await db.select().from(users)
  console.log('👥 USERS:')
  allUsers.forEach(u => console.log(`- ${u.email} (${u.name}) - Org: ${u.organizationId}`))

  // Super Admins
  const allSuperAdmins = await db.select().from(superAdmins)
  console.log('\n🦸 SUPER ADMINS:')
  allSuperAdmins.forEach(sa => console.log(`- User ID: ${sa.userId}`))

  // Organizaciones
  const allOrgs = await db.select().from(organizations)
  console.log('\n🏢 ORGANIZATIONS:')
  allOrgs.forEach(o => console.log(`- ${o.name} (${o.slug}) - ID: ${o.id}`))

  // Módulos
  const allModules = await db.select().from(modules)
  console.log('\n📦 MODULES:')
  allModules.forEach(m => console.log(`- ${m.displayName} (${m.name}) - ID: ${m.id}`))

  // Asignaciones
  const allOrgModules = await db.select().from(organizationModules)
  console.log('\n🔗 ORGANIZATION MODULES:')
  allOrgModules.forEach(om => console.log(`- Org: ${om.organizationId} → Module: ${om.moduleId}`))
}

debug().then(() => process.exit(0))
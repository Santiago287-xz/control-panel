// scripts/assign-modules.ts
import { db } from '../lib/db'
import { users, organizations, modules, organizationModules, userModulePermissions } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function assignModules() {
  console.log('🔧 Asignando módulos...')

  // Buscar gimnasio demo
  const [org] = await db.select().from(organizations)
    .where(eq(organizations.slug, 'gimnasio-demo'))
    .limit(1)

  if (!org) {
    console.log('❌ No se encontró gimnasio-demo')
    return
  }

  // Buscar módulos
  const allModules = await db.select().from(modules)
  console.log(`📦 Encontrados ${allModules.length} módulos`)

  // Buscar super admin
  const [superAdminUser] = await db.select().from(users)
    .where(eq(users.email, 'admin@admin.com'))
    .limit(1)

  if (!superAdminUser) {
    console.log('❌ No se encontró super admin')
    return
  }

  // Asignar todos los módulos a la organización
  for (const module of allModules) {
    try {
      const [existing] = await db.select()
        .from(organizationModules)
        .where(eq(organizationModules.organizationId, org.id))
        .where(eq(organizationModules.moduleId, module.id))
        .limit(1)

      if (!existing) {
        await db.insert(organizationModules).values({
          organizationId: org.id,
          moduleId: module.id,
          grantedBy: superAdminUser.id,
        })
        console.log(`✅ Asignado: ${module.displayName} → ${org.name}`)
      }
    } catch (error) {
      console.log(`❌ Error asignando ${module.displayName}:`, error)
    }
  }

  // Dar permisos al admin de la org
  const [orgAdmin] = await db.select().from(users)
    .where(eq(users.email, 'admin@gimnasio-demo.com'))
    .limit(1)

  if (orgAdmin) {
    const orgModules = await db.select()
      .from(organizationModules)
      .where(eq(organizationModules.organizationId, org.id))

    for (const orgModule of orgModules) {
      try {
        const [existing] = await db.select()
          .from(userModulePermissions)
          .where(eq(userModulePermissions.userId, orgAdmin.id))
          .where(eq(userModulePermissions.organizationModuleId, orgModule.id))
          .limit(1)

        if (!existing) {
          await db.insert(userModulePermissions).values({
            userId: orgAdmin.id,
            organizationModuleId: orgModule.id,
            canRead: true,
            canWrite: true,
            canDelete: true,
            canManage: true,
            grantedBy: superAdminUser.id,
          })
          console.log(`✅ Permisos dados a admin org`)
        }
      } catch (error) {
        console.log(`❌ Error dando permisos:`, error)
      }
    }
  }

  console.log('🎉 Asignación completada')
}

assignModules().then(() => process.exit(0))
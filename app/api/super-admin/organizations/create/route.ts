import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth/config'
import { adminDb } from '@/lib/db/tenant'
import { organizations, users } from '@/lib/db/schema'
import { createTenantSchema } from '@/lib/db/schema-manager'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, slug, type, adminEmail, adminName, adminPassword } = await request.json()

    // 1. Crear organización en esquema público
    const [newOrg] = await adminDb.insert(organizations).values({
      name,
      slug,
      type,
      isActive: true
    }).returning()

    // 2. Crear esquema separado para la organización
    await createTenantSchema(slug)

    // 3. Crear usuario admin en esquema público
    const hashedPassword = bcrypt.hashSync(adminPassword, 10)
    const [adminUser] = await adminDb.insert(users).values({
      email: adminEmail,
      name: adminName,
      hashedPassword,
      organizationId: newOrg.id,
      role: 'admin'
    }).returning()

    return NextResponse.json({ 
      organization: newOrg,
      adminUser: { id: adminUser.id, email: adminUser.email }
    })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
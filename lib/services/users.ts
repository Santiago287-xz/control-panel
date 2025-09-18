import { db } from '@/lib/db'
import { users, superAdmins } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { TokenService } from '@/lib/auth/configtokens'

export interface CreateUserData {
  email: string
  password: string
  name: string
  organizationId?: string
  isOrgAdmin?: boolean
}

export class UserService {
  // Crear usuario
  static async createUser(data: CreateUserData) {
    const hashedPassword = await bcrypt.hash(data.password, 12)
    
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        hashedPassword,
      })
      .returning()

    return user
  }

  // Crear super admin
  static async createSuperAdmin(userId: string, level: number = 1) {
    const [superAdmin] = await db
      .insert(superAdmins)
      .values({
        userId,
        level,
      })
      .returning()

    return superAdmin
  }

  // Login y generar tokens
  static async loginUser(email: string, password: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user || !user.hashedPassword) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Verificar si es super admin
    const [superAdmin] = await db
      .select()
      .from(superAdmins)
      .where(eq(superAdmins.userId, user.id))
      .limit(1)

    // Generar tokens
    const tokens = TokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId || '',
      isSuperAdmin: !!superAdmin,
    })

    // Guardar tokens en DB
    await db
      .update(users)
      .set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 min
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        isSuperAdmin: !!superAdmin,
      },
      tokens,
    }
  }

  // Refresh tokens
  static async refreshTokens(refreshToken: string) {
    const payload = TokenService.verifyRefreshToken(refreshToken)
    if (!payload) {
      throw new Error('Invalid refresh token')
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)

    if (!user) {
      throw new Error('User not found')
    }

    // Verificar si es super admin
    const [superAdmin] = await db
      .select()
      .from(superAdmins)
      .where(eq(superAdmins.userId, user.id))
      .limit(1)

    // Generar nuevos tokens
    const tokens = TokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId || '',
      isSuperAdmin: !!superAdmin,
    })

    // Actualizar en DB
    await db
      .update(users)
      .set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      })
      .where(eq(users.id, user.id))

    return tokens
  }
}
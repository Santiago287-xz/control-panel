import { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users, superAdmins, auditLogs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import speakeasy from "speakeasy"

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text", required: false }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Buscar usuario
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1)

          if (!user || !user.hashedPassword) {
            return null
          }

          // Verificar password
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          )

          if (!isValidPassword) {
            return null
          }

          // Verificar si es super admin y si tiene 2FA
          const [superAdmin] = await db
            .select()
            .from(superAdmins)
            .where(eq(superAdmins.userId, user.id))
            .limit(1)

          // Si es super admin y tiene 2FA habilitado, verificar código
          if (superAdmin?.twoFactorEnabled && superAdmin.twoFactorSecret) {
            if (!credentials.totpCode) {
              throw new Error("2FA_REQUIRED")
            }

            const isValidTOTP = speakeasy.totp.verify({
              secret: superAdmin.twoFactorSecret,
              encoding: 'base32',
              token: credentials.totpCode as string,
              window: 2
            })

            if (!isValidTOTP) {
              throw new Error("INVALID_2FA")
            }
          }

          // Actualizar último login
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id))

          // Log de auditoría
          await db.insert(auditLogs).values({
            userId: user.id,
            organizationId: user.organizationId,
            action: 'login',
            resource: 'user',
            resourceId: user.id,
            success: true,
            ipAddress: '0.0.0.0', // TODO: obtener IP real
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isSuperAdmin: !!superAdmin,
            organizationId: user.organizationId,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutos
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.isSuperAdmin = user.isSuperAdmin
        token.organizationId = user.organizationId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.isSuperAdmin = token.isSuperAdmin as boolean
        session.user.organizationId = token.organizationId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  }
}
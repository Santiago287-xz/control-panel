import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users, superAdmins } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1)

          if (!user || !user.hashedPassword) {
            return null
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          )

          if (!isValidPassword) {
            return null
          }

          // Check if user is super admin
          const [superAdmin] = await db
            .select()
            .from(superAdmins)
            .where(eq(superAdmins.userId, user.id))
            .limit(1)

          // Update last login
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id))

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
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isSuperAdmin = user.isSuperAdmin
        token.organizationId = user.organizationId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.isSuperAdmin = token.isSuperAdmin as boolean
        session.user.organizationId = token.organizationId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
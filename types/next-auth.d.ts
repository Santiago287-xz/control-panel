// types/next-auth.d.ts (ACTUALIZADO)
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      organizationId?: string
      isSuperAdmin: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    organizationId?: string
    isSuperAdmin: boolean
  }
}

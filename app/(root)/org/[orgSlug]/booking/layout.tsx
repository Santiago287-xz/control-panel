// app/(root)/org/[orgSlug]/booking/layout.tsx
"use client"
import { use, ReactNode } from "react"
import { useModuleAccess } from "@/lib/hooks/useModuleAccess"
import { AccessDenied } from "@/components/AccessDenied"

export default function BookingLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = use(params)
  const { hasAccess, loading } = useModuleAccess('booking')

  if (loading) return <div className="p-8">Verificando acceso...</div>
  if (!hasAccess) return <AccessDenied module="Reservas" />

  return <div>{children}</div>
}

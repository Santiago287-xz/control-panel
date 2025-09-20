// app/(root)/org/[orgSlug]/booking/layout.tsx
"use client"
import { ReactNode } from "react"
import { useModuleAccess } from "@/lib/hooks/useModuleAccess"
import { AccessDenied } from "@/components/AccessDenied"

export default function BookingLayout({
  children,
}: {
  children: ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { hasAccess, loading } = useModuleAccess('pos')

  if (loading) return <div className="p-8">Verificando acceso...</div>
  if (!hasAccess) return <AccessDenied module="Punto de Venta" />

  return <div>{children}</div>
}

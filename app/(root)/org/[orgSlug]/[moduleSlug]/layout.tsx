// app/(root)/org/[orgSlug]/[moduleSlug]/layout.tsx
"use client"

import { use } from "react"
import { useModulePages } from "@/lib/hooks/useModulePages"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ModuleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string; moduleSlug: string }>
}) {
  const { orgSlug, moduleSlug } = use(params)
  const { pages, loading, module } = useModulePages(moduleSlug)
  const pathname = usePathname()

  if (loading) return <div className="p-8">Cargando...</div>

  if (!module) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h1 className="text-xl font-bold text-red-700">Módulo no encontrado</h1>
          <p className="text-red-600">El módulo {moduleSlug} no existe o no tienes acceso.</p>
        </div>
      </div>
    )
  }

  const isActive = (pagePath: string) => {
    const fullPath = `/org/${orgSlug}/${moduleSlug}${pagePath}`
    return pathname === fullPath || pathname.startsWith(fullPath + '/')
  }

  return (
    <div className="space-y-6">
      {/* Header del módulo */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{module.displayName}</h1>
        <p className="text-gray-600">{module.description}</p>
      </div>

      {/* Navegación de subpáginas */}
      {pages.length > 0 && (
        <div className="border-b">
          <nav className="flex space-x-1 overflow-x-auto">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/org/${orgSlug}/${moduleSlug}${page.routePath}`}
                className={`px-4 py-2 rounded-t whitespace-nowrap ${
                  isActive(page.routePath)
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {page.icon && <span className="mr-2">{page.icon}</span>}
                {page.displayName}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Contenido de la subpágina */}
      <div className="min-h-[500px]">
        {children}
      </div>
    </div>
  )
}
// app/(root)/org/[orgSlug]/layout.tsx
"use client"

import { use } from "react"
import { useSession, signOut } from "next-auth/react"
import { useModules } from "@/lib/hooks/useModules"
import { useModulePermissionCheck } from "@/lib/hooks/useModulePermissionCheck"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AccessDenied } from "@/components/AccessDenied"

export default function OrgLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = use(params)
  const { data: session } = useSession()
  const { modules, loading } = useModules()
  const pathname = usePathname()

  // Extraer módulo de la URL dinámicamente
  const moduleFromPath = extractModuleFromPath(pathname, orgSlug)
  
  // Verificar permisos solo si estamos en una ruta de módulo
  const { hasAccess, loading: permissionLoading, error } = useModulePermissionCheck(
    moduleFromPath?.moduleName || null
  )

  const isActive = (path: string) => pathname.startsWith(path)

  if (loading || permissionLoading) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="bg-white shadow">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Panel Organización</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-64 bg-white shadow min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/org/${orgSlug}`}
                  className={`block px-3 py-2 rounded ${
                    pathname === `/org/${orgSlug}` ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              {modules.map((module) => (
                <li key={module.id}>
                  <Link
                    href={`/org/${orgSlug}/${module.name}`}
                    className={`block px-3 py-2 rounded ${
                      isActive(`/org/${orgSlug}/${module.name}`) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                    }`}
                  >
                    {module.icon && <span className="mr-2">{module.icon}</span>}
                    {module.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="flex-1 p-6">
          {moduleFromPath && !hasAccess && !error ? (
            <AccessDenied 
              module={moduleFromPath?.displayName || moduleFromPath?.moduleName}
              message={`No tienes permisos para acceder al módulo ${moduleFromPath?.displayName || moduleFromPath?.moduleName}.`}
            />
          ) : children}
        </main>
      </div>
    </div>
  )
}

// Función helper para extraer módulo de la URL
function extractModuleFromPath(pathname: string, orgSlug: string) {
  const orgBasePath = `/org/${orgSlug}`
  
  // Si no estamos en una ruta de org, no hay módulo
  if (!pathname.startsWith(orgBasePath)) return null
  
  // Extraer la parte después de /org/[orgSlug]/
  const pathAfterOrg = pathname.slice(orgBasePath.length)
  
  // Si es la raíz (/org/[orgSlug]) no hay módulo
  if (!pathAfterOrg || pathAfterOrg === '/') return null
  
  // Extraer el primer segmento (el módulo)
  const segments = pathAfterOrg.split('/').filter(Boolean)
  if (segments.length === 0) return null
  
  const moduleName = segments[0]
  
  return {
    moduleName,
    displayName: moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
  }
}
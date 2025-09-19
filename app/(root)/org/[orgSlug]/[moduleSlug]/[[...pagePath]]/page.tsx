// app/(root)/org/[orgSlug]/[moduleSlug]/[[...pagePath]]/page.tsx
"use client"

import { use } from "react"
import { useModulePages } from "@/lib/hooks/useModulePages"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Importar componentes específicos de módulos
import { BookingDashboard } from "@/components/modules/booking/BookingDashboard"
import { BookingList } from "@/components/modules/booking/BookingList"
import { BookingCreate } from "@/components/modules/booking/BookingCreate"
import { BookingEdit } from "@/components/modules/booking/BookingEdit"

import { POSDashboard } from "@/components/modules/pos/POSDashboard"
import { POSList } from "@/components/modules/pos/POSList"
import { POSCreate } from "@/components/modules/pos/POSCreate"

import { UsersDashboard } from "@/components/modules/users/UsersDashboard"
import { UsersList } from "@/components/modules/users/UsersList"
import { UsersCreate } from "@/components/modules/users/UsersCreate"
import { UsersEdit } from "@/components/modules/users/UsersEdit"

import { AnalyticsDashboard } from "@/components/modules/analytics/AnalyticsDashboard"

export default function ModulePage({
  params
}: {
  params: Promise<{ 
    orgSlug: string
    moduleSlug: string
    pagePath?: string[]
  }>
}) {
  const { orgSlug, moduleSlug, pagePath = [] } = use(params)
  const { pages, loading, module } = useModulePages(moduleSlug)
  const router = useRouter()

  // Construir la ruta actual
  const currentPath = pagePath.length > 0 ? `/${pagePath.join('/')}` : ''
  const defaultPath = currentPath || (pages.length > 0 ? pages[0].routePath : '')

  useEffect(() => {
    if (!loading && pages.length > 0 && !currentPath) {
      // Redirigir a la primera página disponible si no hay ruta específica
      router.replace(`/org/${orgSlug}/${moduleSlug}${pages[0].routePath}`)
    }
  }, [loading, pages, currentPath, orgSlug, moduleSlug, router])

  if (loading) return <div className="p-8">Cargando...</div>

  if (!module) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h1 className="text-xl font-bold text-red-700">Módulo no encontrado</h1>
        <p className="text-red-600">El módulo {moduleSlug} no existe o no tienes acceso.</p>
      </div>
    )
  }

  // Verificar acceso a la página específica
  const currentPage = pages.find(page => page.routePath === defaultPath)
  if (defaultPath && !currentPage) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <h1 className="text-xl font-bold text-yellow-700">Página no encontrada</h1>
        <p className="text-yellow-600">La página solicitada no existe o no tienes acceso.</p>
      </div>
    )
  }

  // Renderizar componente específico basado en módulo y página
  const renderPage = () => {
    const key = `${moduleSlug}${defaultPath}`
    
    switch (key) {
      // BOOKING MODULE
      case 'booking':
      case 'booking/':
      case 'booking/dashboard':
        return <BookingDashboard orgSlug={orgSlug} />
      
      case 'booking/list':
        return <BookingList orgSlug={orgSlug} />
      
      case 'booking/create':
        return <BookingCreate orgSlug={orgSlug} />
      
      case 'booking/edit':
        const bookingId = pagePath[1] // /edit/[id]
        return <BookingEdit orgSlug={orgSlug} bookingId={bookingId} />

      // POS MODULE
      case 'pos':
      case 'pos/':
      case 'pos/dashboard':
        return <POSDashboard orgSlug={orgSlug} />
      
      case 'pos/sales':
        return <POSList orgSlug={orgSlug} />
      
      case 'pos/new-sale':
        return <POSCreate orgSlug={orgSlug} />

      // USERS MODULE
      case 'users':
      case 'users/':
      case 'users/dashboard':
        return <UsersDashboard orgSlug={orgSlug} />
      
      case 'users/list':
        return <UsersList orgSlug={orgSlug} />
      
      case 'users/create':
        return <UsersCreate orgSlug={orgSlug} />
      
      case 'users/edit':
        const userId = pagePath[1] // /edit/[id]
        return <UsersEdit orgSlug={orgSlug} userId={userId} />

      // ANALYTICS MODULE
      case 'analytics':
      case 'analytics/':
      case 'analytics/dashboard':
        return <AnalyticsDashboard orgSlug={orgSlug} />

      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded p-6">
            <h2 className="text-lg font-semibold mb-4">Página en construcción</h2>
            <p className="text-gray-600 mb-4">
              La página <code>{defaultPath}</code> del módulo <strong>{module.displayName}</strong> está en desarrollo.
            </p>
            <div className="bg-white p-4 rounded border">
              <h3 className="font-medium mb-2">Información de debug:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Módulo:</strong> {moduleSlug}</li>
                <li><strong>Ruta:</strong> {defaultPath}</li>
                <li><strong>Página actual:</strong> {currentPage?.name || 'No encontrada'}</li>
                <li><strong>Páginas disponibles:</strong> {pages.map(p => p.name).join(', ')}</li>
              </ul>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderPage()}
    </div>
  )
}
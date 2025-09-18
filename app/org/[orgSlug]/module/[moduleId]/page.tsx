"use client"

import { use } from "react"
import { useModules } from "@/lib/hooks/useModules"

export default function ModulePage({
  params
}: {
  params: Promise<{ orgSlug: string; moduleId: string }>
}) {
  const { orgSlug, moduleId } = use(params)
  const { modules, loading } = useModules()

  if (loading) return <div>Cargando...</div>

  const module = modules.find(m => m.id === moduleId)

  if (!module) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h1 className="text-xl font-bold text-red-700">Módulo no encontrado</h1>
        <p className="text-red-600">No tienes acceso a este módulo o no existe.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{module.displayName}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Información del Módulo</h2>
          <p className="text-gray-600">{module.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-3 rounded ${module.canRead ? 'bg-green-100' : 'bg-gray-100'}`}>
            <div className="text-sm font-medium">Leer</div>
            <div className={module.canRead ? 'text-green-600' : 'text-gray-400'}>
              {module.canRead ? '✓' : '✗'}
            </div>
          </div>
          <div className={`p-3 rounded ${module.canWrite ? 'bg-green-100' : 'bg-gray-100'}`}>
            <div className="text-sm font-medium">Escribir</div>
            <div className={module.canWrite ? 'text-green-600' : 'text-gray-400'}>
              {module.canWrite ? '✓' : '✗'}
            </div>
          </div>
          <div className={`p-3 rounded ${module.canDelete ? 'bg-green-100' : 'bg-gray-100'}`}>
            <div className="text-sm font-medium">Eliminar</div>
            <div className={module.canDelete ? 'text-green-600' : 'text-gray-400'}>
              {module.canDelete ? '✓' : '✗'}
            </div>
          </div>
          <div className={`p-3 rounded ${module.canManage ? 'bg-green-100' : 'bg-gray-100'}`}>
            <div className="text-sm font-medium">Gestionar</div>
            <div className={module.canManage ? 'text-green-600' : 'text-gray-400'}>
              {module.canManage ? '✓' : '✗'}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-medium text-blue-900">Contenido del Módulo</h3>
          <p className="text-blue-700">
            Aquí iría el contenido específico del módulo {module.name}.
            Por ejemplo: formularios, listas, dashboards específicos, etc.
          </p>
        </div>
      </div>
    </div>
  )
}
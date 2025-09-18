"use client"

import { usePermissions } from "@/lib/hooks/usePermissions"
import { useSession } from "next-auth/react"

export default function OrgDashboardPage() {
  const { data: session } = useSession()
  const { getAvailableModules, loading } = usePermissions()

  const availableModules = getAvailableModules()

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard - {session?.user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Módulos Disponibles</h2>
          <div className="space-y-2">
            {availableModules.length > 0 ? (
              availableModules.map((module: any) => (
                <div key={module.moduleId} className="p-3 border rounded">
                  <div className="font-medium">Módulo: {module.moduleId.slice(0, 8)}...</div>
                  <div className="text-sm text-gray-600">
                    Permisos: 
                    {module.canRead && " Leer"}
                    {module.canWrite && " Escribir"}
                    {module.canDelete && " Eliminar"}
                    {module.canManage && " Gestionar"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No tienes módulos asignados</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Estado de la Cuenta</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Usuario:</span>
              <span className="font-medium">{session?.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Tipo:</span>
              <span className="font-medium">
                {session?.user?.isSuperAdmin ? "Super Admin" : "Usuario"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Módulos:</span>
              <span className="font-medium">{availableModules.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
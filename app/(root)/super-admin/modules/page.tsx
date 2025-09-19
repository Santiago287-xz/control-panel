// app/(root)/super-admin/modules/page.tsx
"use client"

import { useState, useEffect } from "react"

interface Module {
  id: string
  name: string
  displayName: string
  description: string
  category: string
  isActive: boolean
  pageCount?: number
}

interface AvailableModule {
  name: string
  displayName: string
  description: string
  category: string
  icon: string
  isRegistered: boolean
}

// Módulos disponibles en código
const AVAILABLE_MODULES: AvailableModule[] = [
  {
    name: 'booking',
    displayName: 'Sistema de Reservas',
    description: 'Gestión completa de reservas y horarios',
    category: 'business',
    icon: '📅',
    isRegistered: false
  },
  {
    name: 'pos',
    displayName: 'Punto de Venta',
    description: 'Sistema completo de ventas y facturación',
    category: 'business', 
    icon: '💳',
    isRegistered: false
  },
  {
    name: 'users',
    displayName: 'Gestión de Usuarios',
    description: 'Administración de usuarios y perfiles',
    category: 'core',
    icon: '👥',
    isRegistered: false
  },
  {
    name: 'analytics',
    displayName: 'Panel de Análisis',
    description: 'Reportes y estadísticas avanzadas',
    category: 'analytics',
    icon: '📊',
    isRegistered: false
  },
  {
    name: 'inventory',
    displayName: 'Control de Inventario',
    description: 'Gestión de stock y productos',
    category: 'business',
    icon: '📦',
    isRegistered: false
  }
]

export default function ModulesPage() {
  const [registeredModules, setRegisteredModules] = useState<Module[]>([])
  const [availableModules, setAvailableModules] = useState<AvailableModule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState<AvailableModule | null>(null)
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/super-admin/modules')
      const data = await res.json()
      const registered = data.modules || []
      setRegisteredModules(registered)

      // Marcar módulos ya registrados
      const updated = AVAILABLE_MODULES.map(mod => ({
        ...mod,
        isRegistered: registered.some((reg: Module) => reg.name === mod.name)
      }))
      setAvailableModules(updated)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handleRegisterModule = async (moduleData: AvailableModule) => {
    try {
      const res = await fetch('/api/super-admin/modules/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: moduleData.name,
          displayName: moduleData.displayName,
          description: moduleData.description,
          category: moduleData.category,
          icon: moduleData.icon
        })
      })
      
      if (res.ok) {
        await fetchData() // Refrescar datos
        setSelectedModule(null)
        setShowRegisterForm(false)
      } else {
        alert('Error registrando módulo')
      }
    } catch (error) {
      console.error('Error registering module:', error)
      alert('Error registrando módulo')
    }
  }

  const toggleModuleStatus = async (moduleId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/super-admin/modules/${moduleId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling module:', error)
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Gestión de Módulos</h1>
        <p className="text-gray-600">Registra y administra módulos del sistema</p>
      </div>

      {/* Módulos disponibles para registrar */}
      <div className="bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Módulos Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableModules.filter(mod => !mod.isRegistered).map((module) => (
            <div key={module.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{module.icon}</span>
                <div>
                  <h3 className="font-medium">{module.displayName}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {module.category}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>
              <button
                onClick={() => {
                  setSelectedModule(module)
                  setShowRegisterForm(true)
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm"
              >
                Registrar Módulo
              </button>
            </div>
          ))}
        </div>
        
        {availableModules.filter(mod => !mod.isRegistered).length === 0 && (
          <p className="text-gray-500 text-center py-8">Todos los módulos disponibles están registrados</p>
        )}
      </div>

      {/* Módulos registrados */}
      <div className="bg-zinc-800 rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Módulos Registrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Páginas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registeredModules.map((module) => (
                <tr key={module.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{module.displayName}</div>
                      <div className="text-sm text-gray-500">{module.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{module.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {module.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleModuleStatus(module.id, module.isActive)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        module.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {module.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{module.pageCount || 0}</span>
                      <a
                        href={`/super-admin/modules/${module.id}/pages`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Gestionar
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <a
                        href={`/super-admin/modules/${module.id}/organizations`}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Asignar Orgs
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showRegisterForm && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confirmar Registro</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedModule.icon}</span>
                  <div>
                    <h4 className="font-medium">{selectedModule.displayName}</h4>
                    <p className="text-sm text-gray-600">{selectedModule.description}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>Nombre:</strong> {selectedModule.name}</p>
                  <p><strong>Categoría:</strong> {selectedModule.category}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRegisterModule(selectedModule)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Registrar
                </button>
                <button
                  onClick={() => {
                    setSelectedModule(null)
                    setShowRegisterForm(false)
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
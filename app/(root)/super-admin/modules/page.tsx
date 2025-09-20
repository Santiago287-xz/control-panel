// app/(root)/super-admin/modules/page.tsx - DINÁMICO
"use client"

import { useState, useEffect } from "react"

interface Module {
  id: string
  name: string
  displayName: string
  description: string
  category: string
  isActive: boolean
}

interface ModuleForm {
  name: string
  displayName: string
  description: string
  category: string
  icon: string
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Module | null>(null)
  const [form, setForm] = useState<ModuleForm>({
    name: '',
    displayName: '',
    description: '',
    category: 'business',
    icon: '📦'
  })

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/super-admin/modules')
      const data = await res.json()
      setModules(data.modules || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
    setLoading(false)
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/super-admin/modules/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (res.ok) {
        await fetchModules()
        setShowCreateForm(false)
        setForm({ name: '', displayName: '', description: '', category: 'business', icon: '📦' })
      } else {
        const error = await res.json()
        alert(error.message || 'Error creando módulo')
      }
    } catch (error) {
      console.error('Error creating module:', error)
      alert('Error creando módulo')
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/super-admin/modules/${moduleId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        await fetchModules()
        setShowDeleteConfirm(null)
      } else {
        const error = await res.json()
        alert(error.message || 'Error eliminando módulo')
      }
    } catch (error) {
      console.error('Error deleting module:', error)
      alert('Error eliminando módulo')
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
        fetchModules()
      }
    } catch (error) {
      console.error('Error toggling module:', error)
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Módulos</h1>
          <p className="text-gray-600">Crea y gestiona módulos del sistema</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear Módulo
        </button>
      </div>

      {/* Lista de módulos */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modules.map((module) => (
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
                    <button
                      onClick={() => setShowDeleteConfirm(module)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {modules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <p>No hay módulos registrados</p>
            <p className="text-sm">Crea tu primer módulo</p>
          </div>
        )}
      </div>

      {/* Modal crear módulo */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <form onSubmit={handleCreateModule} className="p-6">
              <h3 className="text-lg font-semibold mb-4">Crear Nuevo Módulo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Slug/Nombre</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full p-2 border rounded text-white"
                    placeholder="ej: inventory, crm, etc"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre Visible</label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setForm({...form, displayName: e.target.value})}
                    className="w-full p-2 border rounded text-white"
                    placeholder="ej: Control de Inventario"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full p-2 border rounded text-white"
                    placeholder="Describe qué hace este módulo"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full p-2 border rounded text-white"
                  >
                    <option className="text-black" value="business">Business</option>
                    <option className="text-black" value="core">Core</option>
                    <option className="text-black" value="analytics">Analytics</option>
                    <option className="text-black" value="tools">Tools</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Icono (emoji)</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({...form, icon: e.target.value})}
                    className="w-full p-2 border rounded text-white"
                    placeholder="📦"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Crear Módulo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-400">Confirmar Eliminación</h3>
              <div className="mb-6">
                <p className="text-sm text-gray-300 mb-2">
                  ¿Eliminar el módulo?
                </p>
                <div className="bg-red-50 p-3 rounded">
                  <p className="font-medium text-red-800">{showDeleteConfirm.displayName}</p>
                  <p className="text-sm text-red-600">{showDeleteConfirm.name}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteModule(showDeleteConfirm.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
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
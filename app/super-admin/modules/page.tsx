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

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    category: "business"
  })

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/modules')
      const data = await res.json()
      setModules(data.modules || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        fetchModules()
        setShowForm(false)
        setFormData({ name: "", displayName: "", description: "", category: "business" })
      }
    } catch (error) {
      console.error('Error creating module:', error)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Módulos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo Módulo
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Crear Módulo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre para mostrar</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="core">Core</option>
                <option value="business">Business</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-800 rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-zinc-700">
            <tr>
              <th className="p-4 text-left">Nombre</th>
              <th className="p-4 text-left">Categoría</th>
              <th className="p-4 text-left">Descripción</th>
              <th className="p-4 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module.id} className="border-t">
                <td className="p-4">
                  <div>
                    <div className="font-medium">{module.displayName}</div>
                    <div className="text-sm text-gray-500">{module.name}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {module.category}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{module.description}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    module.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {module.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
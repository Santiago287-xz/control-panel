// app/(root)/super-admin/organizations/page.tsx - REFACTORED
"use client"

import { useState, useEffect } from "react"

interface Organization {
  id: string
  name: string
  slug: string
  type: string
  isActive: boolean
  assignedModules?: Module[]
}

interface Module {
  id: string
  name: string
  displayName: string
  category: string
  isActive: boolean
}

interface ModuleAssignment {
  moduleId: string
  isEnabled: boolean
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [orgModules, setOrgModules] = useState<ModuleAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [orgsRes, modsRes] = await Promise.all([
        fetch('/api/organization'),
        fetch('/api/modules')
      ])
      
      const orgsData = await orgsRes.json()
      const modsData = await modsRes.json()
      
      setOrganizations(orgsData.organizations || [])
      setModules(modsData.modules?.filter((m: Module) => m.isActive) || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const loadOrgModules = async (orgId: string) => {
    try {
      const res = await fetch(`/api/organization/${orgId}/modules`)
      const data = await res.json()
      
      // Crear array con estado de todos los módulos
      const assignments = modules.map(module => ({
        moduleId: module.id,
        isEnabled: data.modules?.some((m: any) => m.moduleId === module.id && m.isEnabled) || false
      }))
      
      setOrgModules(assignments)
    } catch (error) {
      console.error('Error loading org modules:', error)
    }
  }

  const handleOrgSelect = async (org: Organization) => {
    setSelectedOrg(org)
    await loadOrgModules(org.id)
  }

  const toggleModule = (moduleId: string) => {
    setOrgModules(prev => 
      prev.map(m => 
        m.moduleId === moduleId 
          ? { ...m, isEnabled: !m.isEnabled }
          : m
      )
    )
  }

  const saveAssignments = async () => {
    if (!selectedOrg) return
    
    setSaving(true)
    try {
      const enabledModules = orgModules.filter(m => m.isEnabled).map(m => m.moduleId)
      
      const res = await fetch(`/api/organization/${selectedOrg.id}/modules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleIds: enabledModules })
      })
      
      if (res.ok) {
        alert('Asignaciones guardadas correctamente')
        await fetchData() // Refresh data
      } else {
        const error = await res.json()
        alert(error.message || 'Error guardando asignaciones')
      }
    } catch (error) {
      console.error('Error saving assignments:', error)
      alert('Error guardando asignaciones')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Organizaciones</h1>
        <p className="text-gray-600">Asigna módulos a organizaciones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Organizaciones */}
        <div className="bg-zinc-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Organizaciones</h2>
          <div className="space-y-3">
            {organizations.map((org) => (
              <div 
                key={org.id} 
                className={`p-4 border rounded cursor-pointer transition-colors ${
                  selectedOrg?.id === org.id 
                    ? 'border-blue-500 bg-zinc-800' 
                    : 'border-gray-200 hover:bg-zinc-700'
                }`}
                onClick={() => handleOrgSelect(org)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-gray-500">{org.slug}</div>
                    <div className="text-xs text-gray-400 mt-1">{org.type}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      org.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {org.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                    {selectedOrg?.id === org.id && (
                      <span className="text-xs text-blue-600 font-medium">
                        Seleccionada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asignación de Módulos */}
        <div className="bg-zinc-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Módulos Asignados</h2>
            {selectedOrg && (
              <button
                onClick={saveAssignments}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>

          {!selectedOrg ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🏢</div>
              <p>Selecciona una organización para gestionar sus módulos</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-zinc-800 rounded">
                <p className="text-sm font-medium">Asignando módulos a:</p>
                <p className="text-lg">{selectedOrg.name}</p>
              </div>

              <div className="space-y-3">
                {modules.map((module) => {
                  const assignment = orgModules.find(m => m.moduleId === module.id)
                  const isEnabled = assignment?.isEnabled || false

                  return (
                    <div key={module.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{module.displayName}</div>
                          <div className="text-sm text-gray-500">{module.name}</div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {module.category}
                          </span>
                        </div>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => toggleModule(module.id)}
                          className="sr-only"
                        />
                        <div className={`relative w-12 h-6 rounded-full transition-colors ${
                          isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            isEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>

              {modules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📦</div>
                  <p>No hay módulos activos disponibles</p>
                  <p className="text-sm">Registra módulos primero en la sección Módulos</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Resumen */}
      {selectedOrg && modules.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Resumen de Asignación</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Organización:</span>
              <span className="ml-2 font-medium">{selectedOrg.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Módulos habilitados:</span>
              <span className="ml-2 font-medium">
                {orgModules.filter(m => m.isEnabled).length} de {modules.length}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-600">Módulos activos:</span>
            <span className="ml-2">
              {orgModules
                .filter(m => m.isEnabled)
                .map(m => modules.find(mod => mod.id === m.moduleId)?.displayName)
                .join(', ') || 'Ninguno'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
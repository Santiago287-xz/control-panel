"use client"

import { useState, useEffect } from "react"

interface Organization {
  id: string
  name: string
  slug: string
  type: string
  isActive: boolean
}

interface Module {
  id: string
  name: string
  displayName: string
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>("")
  const [selectedModule, setSelectedModule] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [orgsRes, modsRes] = await Promise.all([
        fetch('/api/organizations'),
        fetch('/api/modules')
      ])
      
      const orgsData = await orgsRes.json()
      const modsData = await modsRes.json()
      
      setOrganizations(orgsData.organizations || [])
      setModules(modsData.modules || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const grantModule = async () => {
    if (!selectedOrg || !selectedModule) return

    try {
      const res = await fetch('/api/organization-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: selectedOrg,
          moduleId: selectedModule
        })
      })
      
      if (res.ok) {
        alert('Módulo otorgado exitosamente')
        setSelectedOrg("")
        setSelectedModule("")
      }
    } catch (error) {
      console.error('Error granting module:', error)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Organizaciones</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Organizaciones</h2>
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{org.name}</div>
                  <div className="text-sm text-gray-500">{org.slug}</div>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  org.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {org.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Asignar Módulo</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Organización</label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar organización</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Módulo</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar módulo</option>
                {modules.map((mod) => (
                  <option key={mod.id} value={mod.id}>{mod.displayName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={grantModule}
              disabled={!selectedOrg || !selectedModule}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Otorgar Módulo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
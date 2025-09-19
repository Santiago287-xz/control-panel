"use client"

import { useState, useEffect } from "react"

interface Stats {
  totalOrganizations: number
  totalModules: number
  activeOrganizations: number
}

export default function SuperAdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrganizations: 0,
    totalModules: 0,
    activeOrganizations: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [orgsRes, modsRes] = await Promise.all([
        fetch('/api/organizations'),
        fetch('/api/modules')
      ])
      
      const orgsData = await orgsRes.json()
      const modsData = await modsRes.json()
      
      const organizations = orgsData.organizations || []
      const modules = modsData.modules || []
      
      setStats({
        totalOrganizations: organizations.length,
        totalModules: modules.length,
        activeOrganizations: organizations.filter((org: any) => org.isActive).length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-zinc-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-100">Organizaciones</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalOrganizations}</p>
          <p className="text-sm text-gray-300">{stats.activeOrganizations} activas</p>
        </div>
        
        <div className="bg-zinc-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-100">Módulos</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalModules}</p>
          <p className="text-sm text-gray-300">Disponibles</p>
        </div>
        
        <div className="bg-zinc-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-100">Sistema</h3>
          <p className="text-3xl font-bold text-purple-600">Activo</p>
          <p className="text-sm text-gray-300">Funcionando</p>
        </div>
      </div>

      <div className="bg-zinc-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/super-admin/modules"
            className="p-4 border rounded hover:bg-zinc-700 transition-colors"
          >
            <h3 className="font-medium">Gestionar Módulos</h3>
            <p className="text-sm text-gray-100">Crear y administrar módulos del sistema</p>
          </a>
          <a
            href="/super-admin/organizations"
            className="p-4 border rounded hover:bg-zinc-700 transition-colors"
          >
            <h3 className="font-medium">Gestionar Organizaciones</h3>
            <p className="text-sm text-gray-100">Asignar módulos a organizaciones</p>
          </a>
        </div>
      </div>
    </div>
  )
}
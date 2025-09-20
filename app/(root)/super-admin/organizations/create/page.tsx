"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateOrganizationPage() {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    type: 'business',
    adminEmail: '',
    adminName: '',
    adminPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/super-admin/organizations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        alert('Organización creada exitosamente')
        router.push('/super-admin/organizations')
      } else {
        const error = await res.json()
        alert(error.message || 'Error creando organización')
      }
    } catch (error) {
      alert('Error de conexión')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Crear Nueva Organización</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-800 p-6 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full p-2 border rounded text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Slug (URL)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({...form, slug: e.target.value.toLowerCase()})}
              className="w-full p-2 border rounded text-white"
              placeholder="mi-organizacion"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => setForm({...form, type: e.target.value})}
            className="w-full p-2 border rounded text-white"
          >
            <option className="text-black" value="gym">Gimnasio</option>
            <option className="text-black" value="spa">Spa</option>
            <option className="text-black" value="clinic">Clínica</option>
            <option className="text-black" value="business">Empresa</option>
          </select>
        </div>

        <hr className="border-gray-600" />
        <h3 className="text-lg font-semibold">Administrador Inicial</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={form.adminName}
              onChange={(e) => setForm({...form, adminName: e.target.value})}
              className="w-full p-2 border rounded text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={form.adminEmail}
              onChange={(e) => setForm({...form, adminEmail: e.target.value})}
              className="w-full p-2 border rounded text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            type="password"
            value={form.adminPassword}
            onChange={(e) => setForm({...form, adminPassword: e.target.value})}
            className="w-full p-2 border rounded text-white"
            minLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Organización'}
        </button>
      </form>
    </div>
  )
}
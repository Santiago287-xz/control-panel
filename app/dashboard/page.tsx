"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/login")
      return
    }

    // Redirect based on user type
    if (session.user.isSuperAdmin) {
      router.push("/super-admin")
    } else if (session.user.organizationId) {
      router.push(`/org/${session.user.organizationId}`)
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Bienvenido, {session?.user?.name}</h2>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}
"use client"

import { use } from "react"
import { useSession, signOut } from "next-auth/react"
import { useModules } from "@/lib/hooks/useModules"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function OrgLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = use(params)
  const { data: session } = useSession()
  const { modules, loading } = useModules()
  const pathname = usePathname()

  const isActive = (path: string) => pathname.startsWith(path)

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Panel Organización</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-64 bg-white shadow min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/org/${orgSlug}`}
                  className={`block px-3 py-2 rounded ${
                    pathname === `/org/${orgSlug}` ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              {modules.map((module) => (
                <li key={module.id}>
                  <Link
                    href={`/org/${orgSlug}/module/${module.id}`}
                    className={`block px-3 py-2 rounded ${
                      isActive(`/org/${orgSlug}/module/${module.id}`) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                    }`}
                  >
                    {module.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-zinc-900">
      <header className="bg-zinc-800 shadow">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Super Admin</h1>
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
        <nav className="w-64 bg-zinc-800/50 shadow min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/super-admin"
                  className={`block px-3 py-2 rounded ${
                    isActive("/super-admin") ? "bg-blue-100 text-blue-700" : "hover:bg-gray-700"
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/super-admin/organizations"
                  className={`block px-3 py-2 rounded ${
                    pathname.startsWith("/super-admin/organizations") ? "bg-blue-100 text-blue-700" : "hover:bg-gray-700"
                  }`}
                >
                  Organizaciones
                </Link>
              </li>
              <li>
                <Link
                  href="/super-admin/modules"
                  className={`block px-3 py-2 rounded ${
                    pathname.startsWith("/super-admin/modules") ? "bg-blue-100 text-blue-700" : "hover:bg-gray-700"
                  }`}
                >
                  Módulos
                </Link>
              </li>
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
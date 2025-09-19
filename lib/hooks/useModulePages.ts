// lib/hooks/useModulePages.ts
"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface ModulePage {
  id: string
  name: string
  displayName: string
  routePath: string
  description?: string
  icon?: string
  requiresId: boolean
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  sortOrder: number
}

interface Module {
  id: string
  name: string
  displayName: string
  description?: string
  icon?: string
  category: string
}

export function useModulePages(moduleSlug: string) {
  const { data: session } = useSession()
  const [pages, setPages] = useState<ModulePage[]>([])
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id || !moduleSlug) return

    async function fetchModulePages() {
      try {
        const res = await fetch(`/api/modules/${moduleSlug}/pages`)
        
        if (!res.ok) {
          throw new Error('Error fetching module pages')
        }
        
        const data = await res.json()
        setModule(data.module)
        setPages(data.pages.sort((a: ModulePage, b: ModulePage) => a.sortOrder - b.sortOrder))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      }
      setLoading(false)
    }

    fetchModulePages()
  }, [session?.user?.id, moduleSlug])

  const getPageByPath = (path: string) => {
    return pages.find(page => page.routePath === path)
  }

  const canAccessPage = (pageName: string, action: 'read' | 'write' | 'delete' = 'read') => {
    const page = pages.find(p => p.name === pageName)
    if (!page) return false

    if (session?.user?.isSuperAdmin) return true

    switch (action) {
      case 'read': return page.canRead
      case 'write': return page.canWrite
      case 'delete': return page.canDelete
      default: return false
    }
  }

  const readablePages = pages.filter(page => page.canRead)
  const writablePages = pages.filter(page => page.canWrite)

  return {
    pages: readablePages,
    allPages: pages,
    module,
    loading,
    error,
    getPageByPath,
    canAccessPage,
    readablePages,
    writablePages,
    hasAnyAccess: readablePages.length > 0
  }
}
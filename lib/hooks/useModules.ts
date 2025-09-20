// lib/hooks/useModules.ts - Hook mejorado
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface Module {
  id: string
  name: string
  displayName: string
  description: string
  category: string
}

interface ModuleWithPermissions extends Module {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canManage: boolean
}

export function useModules() {
  const { data: session } = useSession()
  const [modules, setModules] = useState<ModuleWithPermissions[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    async function fetchData() {
      try {
        const [permissionsRes, modulesRes] = await Promise.all([
          fetch('/api/permissions'),
          fetch('/api/modules-with-details')
        ])
        const permissionsData = await permissionsRes.json()
        const modulesData = await modulesRes.json()
        
        const permissions = permissionsData.permissions || []
        const allModules = modulesData.modules || []
        
        // Combinar módulos con permisos
        const modulesWithPermissions = permissions.map((perm: any) => {
          const module = allModules.find((m: any) => m.id === perm.moduleId)
          return {
            ...module,
            canRead: perm.canRead,
            canWrite: perm.canWrite,
            canDelete: perm.canDelete,
            canManage: perm.canManage
          }
        }).filter((m: any) => m.id) // Solo módulos que existen
        
        setModules(modulesWithPermissions)
      } catch (error) {
        console.error('Error fetching modules:', error)
      }
      setLoading(false)
    }

    fetchData()
  }, [session?.user?.id])

  return {
    modules,
    loading,
    isSuperAdmin: session?.user?.isSuperAdmin || false
  }
}

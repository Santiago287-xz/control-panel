import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface ModulePermission {
  moduleId: string
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canManage: boolean
}

export function usePermissions() {
  const { data: session } = useSession()
  const [permissions, setPermissions] = useState<ModulePermission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    async function fetchPermissions() {
      try {
        const res = await fetch('/api/permissions')
        const data = await res.json()
        setPermissions(data.permissions || [])
      } catch (error) {
        console.error('Error fetching permissions:', error)
      }
      setLoading(false)
    }

    fetchPermissions()
  }, [session?.user?.id])

  const hasPermission = (moduleId: string, action: 'read' | 'write' | 'delete' | 'manage') => {
    if (session?.user?.isSuperAdmin) return true
    
    const permission = permissions.find(p => p.moduleId === moduleId)
    if (!permission) return false

    switch (action) {
      case 'read': return permission.canRead
      case 'write': return permission.canWrite
      case 'delete': return permission.canDelete
      case 'manage': return permission.canManage
      default: return false
    }
  }

  const getAvailableModules = () => {
    if (session?.user?.isSuperAdmin) return permissions
    return permissions.filter(p => p.canRead)
  }

  return {
    permissions,
    loading,
    hasPermission,
    getAvailableModules,
    isSuperAdmin: session?.user?.isSuperAdmin || false
  }
}
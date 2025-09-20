// lib/hooks/useModulePermissionCheck.ts
"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface PermissionCheck {
  hasAccess: boolean
  loading: boolean
  error: string | null
}

export function useModulePermissionCheck(moduleName: string | null): PermissionCheck {
  const { data: session } = useSession()
  const [state, setState] = useState<PermissionCheck>({
    hasAccess: false,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Si no hay módulo a verificar, permitir acceso (ej: dashboard)
    if (!moduleName) {
      setState({ hasAccess: true, loading: false, error: null })
      return
    }

    // Si no hay sesión, denegar
    if (!session?.user?.id) {
      setState({ hasAccess: false, loading: false, error: null })
      return
    }

    // Super admin tiene acceso total
    if (session.user.isSuperAdmin) {
      setState({ hasAccess: true, loading: false, error: null })
      return
    }

    async function checkModuleAccess() {
      try {
        const res = await fetch(`/api/modules/${moduleName}/access-check`)
        
        if (!res.ok) {
          if (res.status === 404) {
            setState({ hasAccess: false, loading: false, error: `Módulo '${moduleName}' no encontrado` })
            return
          }
          throw new Error('Error verificando acceso')
        }
        
        const data = await res.json()
        setState({ 
          hasAccess: data.hasAccess, 
          loading: false, 
          error: null 
        })
      } catch (error) {
        console.error('Error checking module access:', error)
        setState({ 
          hasAccess: false, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Error de conexión' 
        })
      }
    }

    checkModuleAccess()
  }, [moduleName, session?.user?.id, session?.user?.isSuperAdmin])

  return state
}
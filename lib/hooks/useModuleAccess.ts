// lib/hooks/useModuleAccess.ts
"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface AccessCheck {
  hasAccess: boolean
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  loading: boolean
}

export function useModuleAccess(moduleSlug: string): AccessCheck {
  const { data: session } = useSession()
  const [access, setAccess] = useState<AccessCheck>({
    hasAccess: false,
    canRead: false,
    canWrite: false,
    canDelete: false,
    loading: true
  })

  useEffect(() => {
    if (!session?.user?.id || !moduleSlug) {
      setAccess(prev => ({ ...prev, loading: false }))
      return
    }

    async function checkAccess() {
      try {
        // Super admin tiene acceso total
        if (session?.user?.isSuperAdmin) {
          setAccess({
            hasAccess: true,
            canRead: true,
            canWrite: true,
            canDelete: true,
            loading: false
          })
          return
        }

        const res = await fetch(`/api/modules/${moduleSlug}/access-check`)
        if (res.ok) {
          const data = await res.json()
          setAccess({
            hasAccess: data.hasAccess,
            canRead: data.canRead,
            canWrite: data.canWrite,
            canDelete: data.canDelete,
            loading: false
          })
        } else {
          setAccess(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Error checking module access:', error)
        setAccess(prev => ({ ...prev, loading: false }))
      }
    }

    checkAccess()
  }, [session?.user?.id, moduleSlug])

  return access
}

// Hook específico para verificar una página
export function usePageAccess(moduleSlug: string, pageName: string) {
  const { data: session } = useSession()
  const [canAccess, setCanAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id || !moduleSlug || !pageName) {
      setLoading(false)
      return
    }

    async function checkPageAccess() {
      try {
        if (session?.user?.isSuperAdmin) {
          setCanAccess(true)
          setLoading(false)
          return
        }

        const res = await fetch(`/api/modules/${moduleSlug}/pages/${pageName}/access-check`)
        if (res.ok) {
          const data = await res.json()
          setCanAccess(data.canAccess)
        }
      } catch (error) {
        console.error('Error checking page access:', error)
      }
      setLoading(false)
    }

    checkPageAccess()
  }, [session?.user?.id, moduleSlug, pageName])

  return { canAccess, loading }
}
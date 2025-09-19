
// lib/hooks/useModuleData.ts
import { useState, useCallback } from 'react'

export function useModuleData(moduleId: string) {
  const [loading, setLoading] = useState(false)

  const createItem = useCallback(async (data: any) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/modules/${moduleId}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.details?.join(', ') || error.error || 'Error al crear')
      }
      
      return await res.json()
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  const updateItem = useCallback(async (itemId: string, data: any) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/modules/${moduleId}/data/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.details?.join(', ') || error.error || 'Error al actualizar')
      }
      
      return await res.json()
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  const deleteItem = useCallback(async (itemId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/modules/${moduleId}/data/${itemId}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al eliminar')
      }
      
      return await res.json()
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  const refreshData = useCallback(() => {
    // Trigger para refrescar datos en componentes que lo necesiten
    window.dispatchEvent(new CustomEvent('moduleDataRefresh', { detail: { moduleId } }))
  }, [moduleId])

  return {
    loading,
    createItem,
    updateItem,
    deleteItem,
    refreshData
  }
}
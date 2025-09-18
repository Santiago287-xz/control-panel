"use client"

import { usePermissions } from "@/lib/hooks/usePermissions"

interface ProtectedModuleProps {
  module: string
  action: 'read' | 'write' | 'delete' | 'manage'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedModule({ 
  module, 
  action, 
  children, 
  fallback = <div className="text-red-600">Sin permisos</div>
}: ProtectedModuleProps) {
  const { hasPermission, loading } = usePermissions()

  if (loading) {
    return <div className="text-gray-500">Verificando permisos...</div>
  }

  if (!hasPermission(module, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
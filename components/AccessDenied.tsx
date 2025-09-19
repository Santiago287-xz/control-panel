// components/AccessDenied.tsx
interface AccessDeniedProps {
  module?: string
  message?: string
}

export function AccessDenied({ module, message }: AccessDeniedProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-xl font-bold text-red-700 mb-2">Acceso Denegado</h1>
        <p className="text-red-600 mb-4">
          {message || `No tienes permisos para acceder al módulo ${module || 'solicitado'}.`}
        </p>
        <p className="text-sm text-gray-600">
          Contacta al administrador si crees que esto es un error.
        </p>
      </div>
    </div>
  )
}
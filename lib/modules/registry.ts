// lib/modules/registry.ts
export interface ModuleConfig {
  name: string
  displayName: string
  icon: string
  description: string
  category: string
  roles: Record<string, string[]> // role -> allowed actions
}

export const MODULES: Record<string, ModuleConfig> = {
  booking: {
    name: 'booking',
    displayName: 'Reservas',
    icon: 'Calendar',
    description: 'Gestión de reservas y horarios',
    category: 'business',
    roles: {
      admin: ['view', 'create', 'edit', 'delete', 'manage'],
      reception: ['view', 'create', 'edit'],
      court_manager: ['view', 'create', 'edit'],
      user: ['view']
    }
  },
  pos: {
    name: 'pos',
    displayName: 'Punto de Venta',
    icon: 'CreditCard',
    description: 'Sistema de ventas',
    category: 'business',
    roles: {
      admin: ['view', 'create', 'edit', 'delete', 'manage'],
      cashier: ['view', 'create', 'edit'],
      reception: ['view', 'create']
    }
  },
  users: {
    name: 'users',
    displayName: 'Usuarios',
    icon: 'Users',
    description: 'Gestión de usuarios',
    category: 'core',
    roles: {
      admin: ['view', 'create', 'edit', 'delete', 'manage'],
      reception: ['view', 'create', 'edit']
    }
  },
  analytics: {
    name: 'analytics',
    displayName: 'Análisis',
    icon: 'BarChart',
    description: 'Reportes y estadísticas',
    category: 'analytics',
    roles: {
      admin: ['view', 'manage'],
      reception: ['view']
    }
  }
}

export function getModuleConfig(moduleName: string): ModuleConfig | null {
  return MODULES[moduleName] || null
}

export function getUserModulePermissions(moduleName: string, userRole: string): string[] {
  const module = getModuleConfig(moduleName)
  return module?.roles[userRole] || []
}

export function canUserAccess(moduleName: string, userRole: string, action: string): boolean {
  const permissions = getUserModulePermissions(moduleName, userRole)
  return permissions.includes(action)
}

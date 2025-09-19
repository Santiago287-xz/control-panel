// app/org/[orgSlug]/module/[moduleId]/page.tsx
"use client"

import { use, useState } from "react"
import { ModuleDataTable } from "@/components/modules/ModuleDataTable"
import { ModuleDataForm } from "@/components/modules/ModuleDataForm"
import { ModuleDashboard } from "@/components/modules/ModuleDashboard"
import { ModuleSchemaUtils } from "@/lib/modules/schemas"
import { useModuleData } from "@/lib/hooks/useModuleData"
import { usePermissions } from "@/lib/hooks/usePermissions"

export default function ModulePage({
  params
}: {
  params: Promise<{ orgSlug: string; moduleId: string }>
}) {
  const { orgSlug, moduleId } = use(params)
  const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'form'>('dashboard')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)

  const config = ModuleSchemaUtils.getConfig(moduleId)
  const { hasPermission } = usePermissions()
  const { createItem, updateItem, deleteItem, refreshData } = useModuleData(moduleId)

  if (!config) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h1 className="text-xl font-bold text-red-700">Módulo no encontrado</h1>
        <p className="text-red-600">El módulo {moduleId} no está configurado o no tienes acceso.</p>
      </div>
    )
  }

  if (!hasPermission(moduleId, 'read')) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <h1 className="text-xl font-bold text-yellow-700">Sin permisos</h1>
        <p className="text-yellow-600">No tienes permisos para acceder a este módulo.</p>
      </div>
    )
  }

  const handleAction = async (action: string, item?: any) => {
    switch (action) {
      case 'create':
        setSelectedItem(null)
        setShowForm(true)
        break
      
      case 'edit':
        setSelectedItem(item)
        setShowForm(true)
        break
      
      case 'view':
        setSelectedItem(item)
        setCurrentView('form')
        break
      
      case 'delete':
        if (item && confirm('¿Estás seguro de eliminar este elemento?')) {
          try {
            await deleteItem(item.id)
            refreshData()
          } catch (error) {
            alert('Error al eliminar el elemento')
          }
        }
        break
      
      case 'print':
        if (item) {
          // Implementar impresión específica por módulo
          window.open(`/api/modules/${moduleId}/data/${item.id}/print`, '_blank')
        }
        break
      
      default:
        console.log(`Acción personalizada: ${action}`, item)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (selectedItem) {
        await updateItem(selectedItem.id, data)
      } else {
        await createItem(data)
      }
      setShowForm(false)
      setSelectedItem(null)
      refreshData()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar los datos')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setSelectedItem(null)
  }

  const getViews = () => {
    const views = ['dashboard']
    if (config.views.some(v => v.type === 'list')) views.push('list')
    return views
  }

  const listView = config.views.find(v => v.type === 'list')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{config.displayName}</h1>
          <p className="text-gray-600">{config.description}</p>
        </div>
        
        {/* Navegación de vistas */}
        <div className="flex gap-2">
          {getViews().map(view => (
            <button
              key={view}
              onClick={() => setCurrentView(view as any)}
              className={`px-4 py-2 rounded ${
                currentView === view 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {view === 'dashboard' ? 'Panel' : view === 'list' ? 'Lista' : 'Formulario'}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      {showForm ? (
        <ModuleDataForm
          moduleId={moduleId}
          item={selectedItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          {currentView === 'dashboard' && (
            <ModuleDashboard moduleId={moduleId} />
          )}

          {currentView === 'list' && listView && (
            <ModuleDataTable
              moduleId={moduleId}
              viewConfig={listView}
              onItemClick={(item) => setSelectedItem(item)}
              onAction={handleAction}
            />
          )}
        </>
      )}

      {/* Módulos específicos - Secciones especiales */}
      {moduleId === 'sales' && currentView === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Ventas Recientes</h3>
            <RecentSalesWidget />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Métodos de Pago</h3>
            <PaymentMethodsChart />
          </div>
        </div>
      )}

      {moduleId === 'inventory' && currentView === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Productos con Stock Bajo</h3>
            <LowStockWidget />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Categorías</h3>
            <CategoryStatsWidget />
          </div>
        </div>
      )}
    </div>
  )
}

// Widgets específicos para Sales
function RecentSalesWidget() {
  // Implementar widget de ventas recientes
  return (
    <div className="space-y-2">
      <div className="flex justify-between p-2 border-b">
        <span>Cliente A</span>
        <span className="font-bold">$150.00</span>
      </div>
      <div className="flex justify-between p-2 border-b">
        <span>Cliente B</span>
        <span className="font-bold">$89.50</span>
      </div>
      <div className="flex justify-between p-2">
        <span>Cliente C</span>
        <span className="font-bold">$245.75</span>
      </div>
    </div>
  )
}

function PaymentMethodsChart() {
  // Implementar gráfico de métodos de pago
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Efectivo</span>
        <span>45%</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-2">
        <div className="bg-green-500 h-2 rounded" style={{ width: '45%' }}></div>
      </div>
      
      <div className="flex justify-between">
        <span>Tarjeta</span>
        <span>35%</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-2">
        <div className="bg-blue-500 h-2 rounded" style={{ width: '35%' }}></div>
      </div>
      
      <div className="flex justify-between">
        <span>Transferencia</span>
        <span>20%</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-2">
        <div className="bg-purple-500 h-2 rounded" style={{ width: '20%' }}></div>
      </div>
    </div>
  )
}

// Widgets específicos para Inventory
function LowStockWidget() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between p-2 border-b text-red-600">
        <span>Producto A</span>
        <span className="font-bold">2 unidades</span>
      </div>
      <div className="flex justify-between p-2 border-b text-orange-600">
        <span>Producto B</span>
        <span className="font-bold">5 unidades</span>
      </div>
      <div className="flex justify-between p-2 text-yellow-600">
        <span>Producto C</span>
        <span className="font-bold">8 unidades</span>
      </div>
    </div>
  )
}

function CategoryStatsWidget() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Electrónicos</span>
        <span className="font-bold">45 productos</span>
      </div>
      <div className="flex justify-between">
        <span>Ropa</span>
        <span className="font-bold">32 productos</span>
      </div>
      <div className="flex justify-between">
        <span>Comida</span>
        <span className="font-bold">18 productos</span>
      </div>
      <div className="flex justify-between">
        <span>Otros</span>
        <span className="font-bold">12 productos</span>
      </div>
    </div>
  )
}

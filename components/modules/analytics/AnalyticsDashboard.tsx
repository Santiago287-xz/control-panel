
// components/modules/analytics/AnalyticsDashboard.tsx
export function AnalyticsDashboard({ orgSlug }: { orgSlug: string }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Dashboard de Análisis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Ventas por Mes</h3>
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-500">Gráfico de ventas</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Usuarios Activos</h3>
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-500">Gráfico de usuarios</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
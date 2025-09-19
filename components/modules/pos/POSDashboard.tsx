// components/modules/pos/POSDashboard.tsx
export function POSDashboard({ orgSlug }: { orgSlug: string }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Dashboard POS</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Ventas Hoy</h3>
                    <p className="text-3xl font-bold text-green-600">$12,450</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Transacciones</h3>
                    <p className="text-3xl font-bold text-blue-600">47</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Productos</h3>
                    <p className="text-3xl font-bold text-purple-600">156</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Stock Bajo</h3>
                    <p className="text-3xl font-bold text-red-600">8</p>
                </div>
            </div>
        </div>
    )
}
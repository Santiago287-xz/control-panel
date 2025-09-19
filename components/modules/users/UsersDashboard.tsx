// components/modules/users/UsersDashboard.tsx
export function UsersDashboard({ orgSlug }: { orgSlug: string }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Dashboard de Usuarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Total Usuarios</h3>
                    <p className="text-3xl font-bold text-blue-600">156</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Activos</h3>
                    <p className="text-3xl font-bold text-green-600">142</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Nuevos (mes)</h3>
                    <p className="text-3xl font-bold text-purple-600">23</p>
                </div>
            </div>
        </div>
    )
}
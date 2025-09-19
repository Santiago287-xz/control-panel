// components/modules/pos/POSList.tsx
export function POSList({ orgSlug }: { orgSlug: string }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Historial de Ventas</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Nueva Venta
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map(i => (
                            <tr key={i}>
                                <td className="px-6 py-4 whitespace-nowrap">2024-01-{20 + i}</td>
                                <td className="px-6 py-4 whitespace-nowrap">Cliente {i}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${(i * 250).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                        {i % 2 ? 'Efectivo' : 'Tarjeta'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
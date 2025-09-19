// components/modules/pos/POSCreate.tsx
export function POSCreate({ orgSlug }: { orgSlug: string }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Nueva Venta</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Productos</h3>
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex justify-between items-center p-3 border rounded">
                                <span>Producto {i}</span>
                                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                    Agregar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Carrito</h3>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>$0.00</span>
                        </div>
                    </div>
                    <button className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700">
                        Procesar Venta
                    </button>
                </div>
            </div>
        </div>
    )
}
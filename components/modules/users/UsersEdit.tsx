// components/modules/users/UsersEdit.tsx
export function UsersEdit({ orgSlug, userId }: { orgSlug: string; userId?: string }) {
    if (!userId) return <div className="text-red-600">ID de usuario requerido</div>

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Editar Usuario #{userId}</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre</label>
                            <input type="text" defaultValue="Usuario Ejemplo" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" defaultValue="usuario@example.com" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        Actualizar Usuario
                    </button>
                </form>
            </div>
        </div>
    )
}

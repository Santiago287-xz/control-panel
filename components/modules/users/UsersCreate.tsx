// components/modules/users/UsersCreate.tsx
export function UsersCreate({ orgSlug }: { orgSlug: string }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Nuevo Usuario</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre</label>
                            <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Rol</label>
                        <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                            <option>Seleccionar rol</option>
                            <option>Admin</option>
                            <option>Usuario</option>
                        </select>
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        Crear Usuario
                    </button>
                </form>
            </div>
        </div>
    )
}


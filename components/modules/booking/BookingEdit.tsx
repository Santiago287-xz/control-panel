// components/modules/booking/BookingEdit.tsx
export function BookingEdit({ orgSlug, bookingId }: { orgSlug: string; bookingId?: string }) {
  if (!bookingId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-yellow-700">ID de reserva requerido para editar</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Editar Reserva #{bookingId}</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <input
                type="text"
                defaultValue="Juan Pérez"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                defaultValue="11-1234-5678"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cancha</label>
              <select 
                defaultValue="cancha1"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cancha1">Cancha 1</option>
                <option value="cancha2">Cancha 2</option>
                <option value="cancha3">Cancha 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input
                type="date"
                defaultValue="2024-01-25"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora</label>
              <input
                type="time"
                defaultValue="15:00"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Actualizar Reserva
            </button>
            <button
              type="button"
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Cancelar Reserva
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
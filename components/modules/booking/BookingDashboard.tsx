// components/modules/booking/BookingDashboard.tsx
export function BookingDashboard({ orgSlug }: { orgSlug: string }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard de Reservas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Reservas Hoy</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Canceladas</h3>
          <p className="text-3xl font-bold text-red-600">2</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Próximas Reservas</h3>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">Cancha {i}</p>
                <p className="text-sm text-gray-600">Juan Pérez - {14 + i}:00hs</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Confirmada
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
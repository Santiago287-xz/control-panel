"use client"

import { useState, useEffect } from 'react'

interface Court {
  id: string
  name: string
  type: string
}

interface Reservation {
  id: string
  courtId: string
  name: string
  startTime: string
  endTime: string
  status: string
}

export function BookingDashboard({ orgSlug }: { orgSlug: string }) {
  const [courts, setCourts] = useState<Court[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])

  useEffect(() => {
    // Fetch data usando el tenant DB
    fetchData()
  }, [orgSlug])

  const fetchData = async () => {
    try {
      const [courtsRes, reservationsRes] = await Promise.all([
        fetch(`/api/org/${orgSlug}/booking/courts`),
        fetch(`/api/org/${orgSlug}/booking/reservations`)
      ])
      
      if (courtsRes.ok) setCourts(await courtsRes.json())
      if (reservationsRes.ok) setReservations(await reservationsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Canchas</h3>
          {courts.map(court => (
            <div key={court.id} className="p-2 border-b">
              {court.name} ({court.type})
            </div>
          ))}
        </div>
        
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Reservas del Día</h3>
          {reservations.slice(0, 5).map(reservation => (
            <div key={reservation.id} className="p-2 border-b">
              <div className="font-medium">{reservation.name}</div>
              <div className="text-sm text-gray-600">
                {new Date(reservation.startTime).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tu componente Calendar existente aquí */}
      {/* <Calendar courts={courts} /> */}
    </div>
  )
}
// components/modules/booking/SimpleBookingDashboard.tsx
"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Court {
  id: string
  name: string
  type: string
  is_active: boolean
}

interface Reservation {
  id: string
  court_id: string
  court_name?: string
  name: string
  phone: string
  start_time: string
  end_time: string
  status: string
  payment_method: string
}

interface Event {
  id: string
  name: string
  date: string
  start_time: string
  end_time: string
  court_ids: string[]
}

export function BookingDashboard({ orgSlug }: { orgSlug: string }) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'courts' | 'reservations' | 'events'>('courts')
  
  // States
  const [courts, setCourts] = useState<Court[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [showCourtForm, setShowCourtForm] = useState(false)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Form data
  const [courtForm, setCourtForm] = useState({ name: '', type: 'futbol' })
  const [reservationForm, setReservationForm] = useState({
    court_id: '',
    name: '',
    phone: '',
    start_time: '',
    end_time: '',
    payment_method: 'pending'
  })
  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    start_time: '',
    end_time: '',
    court_ids: [] as string[]
  })

  // Fetch data
  useEffect(() => {
    if (session?.user?.organizationId) {
      fetchCourts()
      fetchReservations()
      fetchEvents()
    }
  }, [session, orgSlug])

  const fetchCourts = async () => {
    try {
      const res = await fetch(`/api/org/${orgSlug}/booking/courts`)
      const data = await res.json()
      if (res.ok) setCourts(data.courts || [])
    } catch (err) {
      setError('Error loading courts')
    }
  }

  const fetchReservations = async () => {
    try {
      const res = await fetch(`/api/org/${orgSlug}/booking/reservations`)
      const data = await res.json()
      if (res.ok) setReservations(data.reservations || [])
    } catch (err) {
      setError('Error loading reservations')
    }
  }

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/org/${orgSlug}/booking/events`)
      const data = await res.json()
      if (res.ok) setEvents(data.events || [])
    } catch (err) {
      setError('Error loading events')
    }
  }

  // Court operations
  const handleCourtSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingItem 
        ? `/api/org/${orgSlug}/booking/courts/${editingItem.id}`
        : `/api/org/${orgSlug}/booking/courts`
      
      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courtForm)
      })

      if (res.ok) {
        await fetchCourts()
        setShowCourtForm(false)
        setEditingItem(null)
        setCourtForm({ name: '', type: 'futbol' })
      } else {
        setError('Error saving court')
      }
    } catch (err) {
      setError('Error saving court')
    }
    setLoading(false)
  }

  const deleteCourt = async (id: string) => {
    if (!confirm('Delete this court?')) return
    
    try {
      const res = await fetch(`/api/org/${orgSlug}/booking/courts/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) await fetchCourts()
    } catch (err) {
      setError('Error deleting court')
    }
  }

  // Reservation operations
  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingItem 
        ? `/api/org/${orgSlug}/booking/reservations/${editingItem.id}`
        : `/api/org/${orgSlug}/booking/reservations`
      
      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reservationForm,
          startTime: reservationForm.start_time,
          endTime: reservationForm.end_time,
          courtId: reservationForm.court_id,
          paymentMethod: reservationForm.payment_method
        })
      })

      if (res.ok) {
        await fetchReservations()
        setShowReservationForm(false)
        setEditingItem(null)
        setReservationForm({
          court_id: '',
          name: '',
          phone: '',
          start_time: '',
          end_time: '',
          payment_method: 'pending'
        })
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Error saving reservation')
      }
    } catch (err) {
      setError('Error saving reservation')
    }
    setLoading(false)
  }

  const deleteReservation = async (id: string) => {
    if (!confirm('Delete this reservation?')) return
    
    try {
      const res = await fetch(`/api/org/${orgSlug}/booking/reservations/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) await fetchReservations()
    } catch (err) {
      setError('Error deleting reservation')
    }
  }

  // Event operations
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingItem 
        ? `/api/org/${orgSlug}/booking/events/${editingItem.id}`
        : `/api/org/${orgSlug}/booking/events`
      
      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventForm,
          startTime: eventForm.start_time,
          endTime: eventForm.end_time,
          courtIds: eventForm.court_ids
        })
      })

      if (res.ok) {
        await fetchEvents()
        setShowEventForm(false)
        setEditingItem(null)
        setEventForm({
          name: '',
          date: '',
          start_time: '',
          end_time: '',
          court_ids: []
        })
      } else {
        setError('Error saving event')
      }
    } catch (err) {
      setError('Error saving event')
    }
    setLoading(false)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    
    try {
      const res = await fetch(`/api/org/${orgSlug}/booking/events/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) await fetchEvents()
    } catch (err) {
      setError('Error deleting event')
    }
  }

  // Edit handlers
  const editCourt = (court: Court) => {
    setEditingItem(court)
    setCourtForm({ name: court.name, type: court.type })
    setShowCourtForm(true)
  }

  const editReservation = (reservation: Reservation) => {
    setEditingItem(reservation)
    setReservationForm({
      court_id: reservation.court_id,
      name: reservation.name,
      phone: reservation.phone,
      start_time: reservation.start_time.slice(0, 16),
      end_time: reservation.end_time.slice(0, 16),
      payment_method: reservation.payment_method
    })
    setShowReservationForm(true)
  }

  const editEvent = (event: Event) => {
    setEditingItem(event)
    setEventForm({
      name: event.name,
      date: event.date.slice(0, 10),
      start_time: event.start_time.slice(11, 16),
      end_time: event.end_time.slice(11, 16),
      court_ids: event.court_ids || []
    })
    setShowEventForm(true)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Booking Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(['courts', 'reservations', 'events'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Courts Tab */}
      {activeTab === 'courts' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Courts</h2>
            <button
              onClick={() => setShowCourtForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Court
            </button>
          </div>

          {showCourtForm && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <form onSubmit={handleCourtSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Court name"
                    value={courtForm.name}
                    onChange={(e) => setCourtForm({...courtForm, name: e.target.value})}
                    className="border rounded px-3 py-2"
                    required
                  />
                  <select
                    value={courtForm.type}
                    onChange={(e) => setCourtForm({...courtForm, type: e.target.value})}
                    className="border rounded px-3 py-2"
                  >
                    <option value="futbol">Futbol</option>
                    <option value="padel">Padel</option>
                  </select>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCourtForm(false)
                      setEditingItem(null)
                      setCourtForm({ name: '', type: 'futbol' })
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {courts.map((court) => (
              <div key={court.id} className="bg-white border rounded p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{court.name}</h3>
                  <p className="text-gray-500 capitalize">{court.type}</p>
                </div>
                <div>
                  <button
                    onClick={() => editCourt(court)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCourt(court.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Reservations</h2>
            <button
              onClick={() => setShowReservationForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Reservation
            </button>
          </div>

          {showReservationForm && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <form onSubmit={handleReservationSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={reservationForm.court_id}
                    onChange={(e) => setReservationForm({...reservationForm, court_id: e.target.value})}
                    className="border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Court</option>
                    {courts.map((court) => (
                      <option key={court.id} value={court.id}>{court.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Customer name"
                    value={reservationForm.name}
                    onChange={(e) => setReservationForm({...reservationForm, name: e.target.value})}
                    className="border rounded px-3 py-2"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={reservationForm.phone}
                    onChange={(e) => setReservationForm({...reservationForm, phone: e.target.value})}
                    className="border rounded px-3 py-2"
                  />
                  <select
                    value={reservationForm.payment_method}
                    onChange={(e) => setReservationForm({...reservationForm, payment_method: e.target.value})}
                    className="border rounded px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={reservationForm.start_time}
                    onChange={(e) => setReservationForm({...reservationForm, start_time: e.target.value})}
                    className="border rounded px-3 py-2"
                    required
                  />
                  <input
                    type="datetime-local"
                    value={reservationForm.end_time}
                    onChange={(e) => setReservationForm({...reservationForm, end_time: e.target.value})}
                    className="border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReservationForm(false)
                      setEditingItem(null)
                      setReservationForm({
                        court_id: '',
                        name: '',
                        phone: '',
                        start_time: '',
                        end_time: '',
                        payment_method: 'pending'
                      })
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{reservation.name}</h3>
                    <p className="text-gray-600">{reservation.phone}</p>
                    <p className="text-gray-500">{reservation.court_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(reservation.start_time).toLocaleString()} - 
                      {new Date(reservation.end_time).toLocaleString()}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      reservation.payment_method === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {reservation.payment_method}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => editReservation(reservation)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteReservation(reservation.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Events</h2>
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Event
            </button>
          </div>

          {showEventForm && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <form onSubmit={handleEventSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Event name"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                    className="border rounded px-3 py-2"
                    required
                  />
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    className="border rounded px-3 py-2"
                    required
                  />
                  <input
                    type="time"
                    value={eventForm.start_time}
                    onChange={(e) => setEventForm({...eventForm, start_time: e.target.value})}
                    className="border rounded px-3 py-2"
                    required
                  />
                  <input
                    type="time"
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({...eventForm, end_time: e.target.value})}
                    className="border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Select Courts:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {courts.map((court) => (
                      <label key={court.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={eventForm.court_ids.includes(court.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEventForm({
                                ...eventForm,
                                court_ids: [...eventForm.court_ids, court.id]
                              })
                            } else {
                              setEventForm({
                                ...eventForm,
                                court_ids: eventForm.court_ids.filter(id => id !== court.id)
                              })
                            }
                          }}
                          className="mr-2"
                        />
                        {court.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventForm(false)
                      setEditingItem(null)
                      setEventForm({
                        name: '',
                        date: '',
                        start_time: '',
                        end_time: '',
                        court_ids: []
                      })
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white border rounded p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{event.name}</h3>
                  <p className="text-gray-500">
                    {new Date(event.date).toLocaleDateString()} | 
                    {event.start_time} - {event.end_time}
                  </p>
                  <p className="text-sm text-gray-400">
                    Courts: {event.court_ids?.length || 0}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => editEvent(event)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
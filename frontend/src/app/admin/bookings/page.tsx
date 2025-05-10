'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { bookingApi, Booking, schedulesApi } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { jwtDecode } from 'jwt-decode'

interface User {
  is_admin: boolean
}

// Extend Booking with schedule details
interface EnrichedBooking extends Booking {
  theatre_name: string
  start_time: string
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/auth/login')
      return
    }

    try {
      const decoded = jwtDecode<User>(token)
      if (!decoded.is_admin) {
        router.push('/')
        return
      }
    } catch {
      router.push('/auth/login')
      return
    }

    loadBookings()
  }, [router])

  const loadBookings = async () => {
    try {
      // Fetch raw bookings
      const data = await bookingApi.getAllAdmin()
      // Enrich each with theatre and time
      const enriched = await Promise.all(
        data.map(async (b) => {
          const sched = await schedulesApi.getById(b.scheduleId)
          return {
            ...b,
            theatre_name: sched.theatre_name,
            start_time: sched.start_time,
          }
        })
      )
      setBookings(enriched)
    } catch {
      setError('Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">View Bookings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={booking.movie_poster}
                      alt={booking.movie_name}
                      className="h-16 w-12 object-cover rounded"
                    />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {booking.movie_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(booking.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Theatre: {booking.theatre_name} • {booking.start_time}
                      </p>
                      <p className="text-sm text-gray-500">
                        User: {booking.username}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${booking.total_amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.payment_method}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`capitalize ${
                      booking.status === 'confirmed' ? 'text-green-600' :
                      booking.status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <span className="font-medium">Seats:</span>{' '}
                    {booking.seats.map((seat, idx) => (
                      <span key={idx}>
                        {parseInt(seat.row)}-{parseInt(seat.number)}
                        {idx < booking.seats.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { bookingApi, Booking } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { jwtDecode } from 'jwt-decode'

interface User {
  is_admin: boolean
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
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
    } catch (error) {
      console.error('Error decoding token:', error)
      router.push('/auth/login')
      return
    }

    loadBookings()
  }, [router])

  const loadBookings = async () => {
    try {
      const data = await bookingApi.getAllAdmin()
      setBookings(data)
    } catch (err) {
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
                    {booking.seats.map((seat, index) => (
                      <span key={index}>
                        {seat.row}{seat.number}
                        {index < booking.seats.length - 1 ? ', ' : ''}
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
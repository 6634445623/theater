'use client'

import { useEffect, useState } from 'react'
import { bookingsApi, ticketsApi, Booking, schedulesApi } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { setToken } from '@/lib/auth'
import { QRCodeModal } from '@/components/ui/QRCodeModal'
import { useLoading } from '@/lib/LoadingContext'

interface BookingsClientProps {
  token: string | null
}

// Extend Booking with schedule details
interface EnrichedBooking extends Booking {
  theatre_name: string
  start_time: string
}

export function BookingsClient({ token }: BookingsClientProps) {
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<EnrichedBooking | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const { withLoading } = useLoading()

  useEffect(() => {
    if (!token) return
    setToken(token)

    bookingsApi.getMyBookings()
      .then(async (raw) => {
        const enriched = await Promise.all(
          raw.map(async (b) => {
            // fetch schedule details per booking
            const sched = await schedulesApi.getById(b.scheduleId)
            return {
              ...b,
              theatre_name: sched.theatre_name,
              start_time: sched.start_time,
            }
          })
        )
        setBookings(enriched)
      })
      .catch(err => setError(err.message))
  }, [token])

  const handleBookingClick = async (booking: EnrichedBooking) => {
    try {
      const result = await withLoading(ticketsApi.getById(booking.id))
      setQrCode(result.qr)
      setSelectedBooking(booking)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load QR code')
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link
          href="/movies"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Browse Movies
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Bookings</h1>
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You have no bookings yet.</p>
            <Link
              href="/movies"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => handleBookingClick(booking)}
              className="bg-white rounded-lg shadow-sm border p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="relative h-24 w-16 flex-shrink-0">
                    <Image
                      src={booking.movie_poster}
                      alt={booking.movie_name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{booking.movie_name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.date).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.theatre_name} &bull; {booking.start_time}
                    </p>
                    <p className="text-sm text-gray-500">
                      Seats: {booking.seats.map(s => `${parseInt(s.row)}-${parseInt(s.number)}`).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    ${booking.total_amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{booking.payment_method}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedBooking && qrCode && (
        <QRCodeModal
          isOpen={!!selectedBooking}
          onClose={() => { setSelectedBooking(null); setQrCode(null) }}
          qrCode={qrCode}
          movieName={selectedBooking.movie_name}
          seatInfo={`Seats: ${selectedBooking.seats.map(s => `${parseInt(s.row)}-${parseInt(s.number)}`).join(', ')}`}
        />
      )}
    </div>
  )
}
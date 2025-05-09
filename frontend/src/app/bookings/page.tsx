import { Metadata } from 'next'
import { bookingsApi } from '@/lib/api'
import { requireAuth } from '@/lib/serverAuth'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Bookings - Movie Theater',
  description: 'View your movie ticket bookings and booking history.',
}

export default async function BookingsPage() {
  await requireAuth()
  const bookings = await bookingsApi.getMyBookings()

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
              className="bg-white rounded-lg shadow-sm border p-4 space-y-3"
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
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Seats: {booking.seats.map(seat => 
                        `${seat.row}-${seat.number}`
                      ).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    ${booking.total_amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.payment_method}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
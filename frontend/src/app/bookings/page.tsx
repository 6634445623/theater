import { Metadata } from 'next'
import { bookingsApi } from '@/lib/api'
import { requireAuth } from '@/lib/serverAuth'

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
          <p className="text-gray-600">You have no bookings yet.</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm border p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium">Booking #{booking.id}</h3>
                  <p className="text-sm text-gray-600">
                    {booking.seats.length} seat{booking.seats.length > 1 ? 's' : ''} - {booking.seats.join(', ')}
                  </p>
                </div>
                <span className={`px-2 py-1 text-sm rounded-full ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                Total paid: ${booking.totalPrice.toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
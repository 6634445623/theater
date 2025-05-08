import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Schedule, bookingsApi } from '@/lib/api'
import { SeatGrid } from '@/components/ui/SeatGrid'

interface BookingFormProps {
  schedules: Schedule[]
}

export function BookingForm({ schedules }: BookingFormProps) {
  const router = useRouter()
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScheduleSelect = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setSelectedSeats([])
    setError(null)
  }

  const handleSeatToggle = (seatId: string) => {
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    )
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchedule || selectedSeats.length === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      const booking = await bookingsApi.create({
        scheduleId: selectedSchedule.id,
        seats: selectedSeats,
      })
      router.push(`/bookings/${booking.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Showtime
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {schedules.map((schedule) => (
            <button
              key={schedule.id}
              type="button"
              onClick={() => handleScheduleSelect(schedule)}
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm rounded-md border ${
                selectedSchedule?.id === schedule.id
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <time dateTime={schedule.showtime}>
                {new Date(schedule.showtime).toLocaleTimeString()}
              </time>
              <div className="text-xs text-gray-500">
                ${schedule.price.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedSchedule && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Seats
          </label>
          <SeatGrid
            selectedSeats={selectedSeats}
            onSeatToggle={handleSeatToggle}
            disabled={isSubmitting}
          />
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      )}

      {selectedSchedule && selectedSeats.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Total ({selectedSeats.length} seats):</span>
            <span className="font-medium">
              ${(selectedSchedule.price * selectedSeats.length).toFixed(2)}
            </span>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Book Tickets'}
          </button>
        </div>
      )}
    </form>
  )
}
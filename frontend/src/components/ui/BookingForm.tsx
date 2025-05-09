'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { TempTicket, seatsApi, Schedule } from '@/lib/api'
import { SeatGrid } from '@/components/ui/SeatGrid'
import { useLoading } from '@/lib/LoadingContext'
import Cookies from 'js-cookie'

export interface BookingFormProps {
  schedules: {
    [date: string]: {
      [theatre: string]: {
        [time: string]: {
          available: boolean;
          scheduleId: number;
        };
      };
    };
  };
}

export function BookingForm({ schedules }: BookingFormProps) {
  const router = useRouter();
  const { withLoading, isLoading } = useLoading();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [tempTickets, setTempTickets] = useState<TempTicket[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Transform nested schedules object into flat array
  const flatSchedules = useMemo(() => {
    if (!schedules) return [];
    
    const result: Schedule[] = [];
    Object.entries(schedules).forEach(([date, theatres]) => {
      if (!date || !theatres) return;
      
      Object.entries(theatres).forEach(([theatre_name, times]) => {
        if (!theatre_name || !times) return;
        
        Object.entries(times).forEach(([start_time, details]) => {
          if (!start_time || !details?.scheduleId) return;
          
          // Validate the date format
          const scheduleDate = new Date(date);
          if (isNaN(scheduleDate.getTime())) return;
          
          result.push({
            id: details.scheduleId,
            date,
            theatre_name,
            start_time,
            available: Boolean(details.available)
          } as Schedule);
        });
      });
    });
    return result.sort((a, b) => 
      new Date(a.date + ' ' + a.start_time).getTime() - 
      new Date(b.date + ' ' + b.start_time).getTime()
    );
  }, [schedules]);

  useEffect(() => {
    const hasToken = !!Cookies.get('token');
    setIsAuthenticated(hasToken);
  }, []);

  const handleScheduleSelect = (schedule: Schedule) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    setTempTickets([]);
    setError(null);
  };

  const handleSeatToggle = (seatId: string) => {
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || selectedSeats.length === 0) return;

    setError(null);

    try {
      // Create a promise chain for withLoading
      const bookingPromise = (async () => {
        console.log('Starting booking process:', {
          selectedSeats,
          scheduleId: selectedSchedule.id
        });

        // Get temporary tickets first
        const tickets = await seatsApi.getTempTickets(selectedSchedule.id);
        console.log('Current temp tickets:', tickets);

        const ticketIds = tickets
          .filter(t => selectedSeats.includes(t.seatId.toString()))
          .map(t => t.ticketId);

        console.log('Filtered ticket IDs:', ticketIds);

        // Validate that we have tickets for all selected seats
        if (ticketIds.length === 0) {
          throw new Error('No valid tickets found for the selected seats');
        }

        if (ticketIds.length !== selectedSeats.length) {
          console.log('Mismatch between selected seats and tickets:', {
            selectedSeats,
            ticketIds,
            tempTickets: tickets
          });
          throw new Error('Some selected seats are no longer available');
        }

        // Book the tickets
        await seatsApi.book(ticketIds);
        router.push('/bookings');
      })();

      await withLoading(bookingPromise);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Showtime
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {flatSchedules.map((schedule) => {
            const showDate = new Date(schedule.date);
            const formattedDate = showDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedTime = new Date(`2000-01-01T${schedule.start_time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            });

            return (
              <button
                key={`${schedule.id}-${schedule.date}-${schedule.start_time}`}
                type="button"
                onClick={() => handleScheduleSelect(schedule)}
                disabled={isLoading || !schedule.available}
                className={`px-4 py-2 text-sm rounded-md border ${
                  selectedSchedule?.id === schedule.id
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : schedule.available
                    ? 'border-gray-300 hover:border-gray-400'
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span>{schedule.theatre_name}</span>
                    <span>{formattedDate}</span>
                  </div>
                  <div className="text-center font-medium">
                    {formattedTime}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedSchedule && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Seats
          </label>
          <SeatGrid
            scheduleId={selectedSchedule.id}
            selectedSeats={selectedSeats}
            onSeatToggle={handleSeatToggle}
            disabled={isLoading}
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
            <span>Total (1 seat):</span>
            <span className="font-medium">
              $120.00
            </span>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : 'Book Ticket'}
          </button>
        </div>
      )}
    </form>
  );
}
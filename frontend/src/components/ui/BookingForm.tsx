'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { TempTicket, seatsApi, Schedule, Seat } from '@/lib/api'
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
  const [seatMap, setSeatMap] = useState<Record<string, Record<string, Record<string, Seat>>>>({});

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

  const handleScheduleSelect = async (schedule: Schedule) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    setTempTickets([]);
    setError(null);

    try {
      const seats = await seatsApi.getSeats(schedule.id);
      setSeatMap(seats);
    } catch (err) {
      setError('Failed to load seats');
    }
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

  // Calculate total price based on selected seats and their zones
  const totalPrice = useMemo(() => {
    if (!selectedSeats.length || !seatMap) return 0;

    return selectedSeats.reduce((total, seatId) => {
      // Find the seat in the seat map
      for (const zone of Object.values(seatMap)) {
        for (const row of Object.values(zone)) {
          const seat = row[seatId];
          if (seat) {
            return total + seat.price;
          }
        }
      }
      return total;
    }, 0);
  }, [selectedSeats, seatMap]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Schedule
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flatSchedules.map((schedule) => (
            <button
              key={schedule.id}
              type="button"
              onClick={() => handleScheduleSelect(schedule)}
              disabled={!schedule.available}
              className={`p-4 border rounded-lg text-left transition-colors
                ${
                  selectedSchedule?.id === schedule.id
                    ? 'border-blue-500 bg-blue-50'
                    : schedule.available
                    ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }
              `}
            >
              <div className="font-medium">
                {new Date(schedule.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="text-sm text-gray-500">
                {schedule.theatre_name} - {schedule.start_time}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedSchedule && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Seat
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
            <span>Total ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}):</span>
            <span className="font-medium">
              ${totalPrice.toFixed(2)}
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
'use client'

import { useEffect, useState } from 'react'
import { Seat, TempTicket, seatsApi } from '@/lib/api'

interface SeatGridProps {
  scheduleId: number;
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
  disabled?: boolean;
}

type SeatMap = Record<string, Record<string, Record<string, Seat>>>;

export function SeatGrid({ scheduleId, selectedSeats, onSeatToggle, disabled = false }: SeatGridProps) {
  const [seatMap, setSeatMap] = useState<SeatMap>({});
  const [tempTickets, setTempTickets] = useState<TempTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [seats, temps] = await Promise.all([
          seatsApi.getBySchedule(scheduleId),
          seatsApi.getTempTickets(scheduleId)
        ]);
        setSeatMap(seats);
        setTempTickets(temps);

        // Auto-select any temporary tickets
        const tempSeatIds = temps.map(t => t.seatId.toString());
        tempSeatIds.forEach(seatId => {
          if (!selectedSeats.includes(seatId)) {
            onSeatToggle(seatId);
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load seats');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [scheduleId, onSeatToggle, selectedSeats]);

  // Cleanup temporary tickets on unmount and page unload
  useEffect(() => {
    const cleanup = async () => {
      try {
        await Promise.all(
          tempTickets.map(ticket => seatsApi.unselectSeat(ticket.ticketId))
        );
      } catch (error) {
        console.error('Failed to cleanup temporary tickets:', error);
      }
    };

    // Handle page unload
    window.addEventListener('beforeunload', cleanup);

    // Handle component unmount
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [tempTickets]);

  const handleSeatToggle = async (seatId: string) => {
    if (disabled) return;

    try {
      // Validate seat availability first
      const validation = await seatsApi.validateSeat(parseInt(seatId), scheduleId);
      if (validation.available === 0) {
        setError('This seat is no longer available');
        return;
      }

      if (selectedSeats.includes(seatId)) {
        // Find the temp ticket for this seat
        const tempTicket = tempTickets.find(t => t.seatId.toString() === seatId);
        if (tempTicket) {
          await seatsApi.unselectSeat(tempTicket.ticketId);
          setTempTickets(prev => prev.filter(t => t.ticketId !== tempTicket.ticketId));
        }
      } else {
        // Create a new temp ticket
        const { ticketId } = await seatsApi.selectSeat(parseInt(seatId), scheduleId);
        setTempTickets(prev => [...prev, { ticketId, seatId: parseInt(seatId), row: 0 }]);
      }
      onSeatToggle(seatId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle seat');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading seats...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  const zones = Object.keys(seatMap).sort();

  return (
    <div className="space-y-8">
      {/* Screen indicator */}
      <div className="relative">
        <div className="h-2 bg-gray-300 rounded-lg w-3/4 mx-auto" />
        <p className="text-center text-sm text-gray-500 mt-2">Screen</p>
      </div>

      {/* Seat grid */}
      {zones.map((zone) => {
        const rows = Object.keys(seatMap[zone]).sort((a, b) => Number(a) - Number(b));
        return (
          <div key={zone} className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">{zone}</h3>
            <div className="grid gap-4">
              {rows.map((row) => {
                const seats = seatMap[zone][row];
                return (
                  <div key={`${zone}-${row}`} className="flex justify-center gap-2">
                    <span className="w-6 text-center text-sm text-gray-500">
                      {row}
                    </span>
                    {Object.entries(seats).map(([seatId, seat]) => {
                      const isSelected = selectedSeats.includes(seatId);
                      
                      if (seat.is_spacer) {
                        return <div key={seatId} className="w-8 h-8" />;
                      }

                      return (
                        <button
                          key={seatId}
                          type="button"
                          onClick={() => handleSeatToggle(seatId)}
                          disabled={disabled || !seat.available}
                          className={`w-8 h-8 rounded-t-lg text-xs font-medium transition-colors
                            ${
                              isSelected
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : seat.available
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          style={seat.color ? { backgroundColor: seat.color } : undefined}
                        >
                          {seat.column}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex justify-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded-t-md" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded-t-md" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded-t-md" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Seat, TempTicket, seatsApi } from '@/lib/api'
import { useLoading } from '@/lib/LoadingContext'

interface SeatGridProps {
  scheduleId: number;
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
  disabled?: boolean;
}

type SeatMap = Record<string, Record<string, Record<string, Seat>>>;

export function SeatGrid({ scheduleId, selectedSeats, onSeatToggle, disabled = false }: SeatGridProps) {
  const { withLoading, isLoading: globalLoading } = useLoading();
  const [seatMap, setSeatMap] = useState<SeatMap>({});
  const [tempTickets, setTempTickets] = useState<TempTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the cleanup function
  const cleanupTickets = useCallback(async () => {
    try {
      await Promise.all(
        tempTickets.map(ticket => seatsApi.unselectSeat(ticket.ticketId))
      );
    } catch (error) {
      console.error('Failed to cleanup temporary tickets:', error);
    }
  }, [tempTickets]);

  // Load initial data
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const loadPromise = (async () => {
          const [seats, temps] = await Promise.all([
            seatsApi.getSeats(scheduleId),
            seatsApi.getTempTickets(scheduleId)
          ]);
          
          if (!mounted) return;
          
          setSeatMap(seats);
          setTempTickets(temps);

          // Auto-select any temporary tickets
          const tempSeatIds = temps.map(t => t.seatId.toString());
          tempSeatIds.forEach(seatId => {
            if (!selectedSeats.includes(seatId)) {
              onSeatToggle(seatId);
            }
          });
        })();

        await withLoading(loadPromise);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load seats');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [scheduleId, withLoading, onSeatToggle, selectedSeats]); // Added selectedSeats and onSeatToggle to dependencies

  // Cleanup temporary tickets on unmount
  useEffect(() => {
    return () => {
      cleanupTickets();
    };
  }, [cleanupTickets]);

  const handleSeatToggle = async (seatId: string) => {
    if (disabled || globalLoading) return;

    try {
      const togglePromise = (async () => {
        if (selectedSeats.includes(seatId)) {
          // Find the temp ticket for this seat
          const tempTicket = tempTickets.find(t => t.seatId.toString() === seatId);
          if (tempTicket) {
            try {
              await seatsApi.unselectSeat(tempTicket.ticketId);
              setTempTickets(prev => prev.filter(t => t.ticketId !== tempTicket.ticketId));
              onSeatToggle(seatId);
            } catch (error) {
              console.error('Failed to unselect seat:', error);
              // If unselection fails, refresh the temp tickets
              const updatedTemps = await seatsApi.getTempTickets(scheduleId);
              setTempTickets(updatedTemps);
              throw error;
            }
          } else {
            console.warn('No temp ticket found for seat:', seatId);
            onSeatToggle(seatId);
          }
        } else {
          // If there's a previously selected seat, unselect it first
          if (selectedSeats.length > 0) {
            const prevSeatId = selectedSeats[0];
            const prevTempTicket = tempTickets.find(t => t.seatId.toString() === prevSeatId);
            if (prevTempTicket) {
              await seatsApi.unselectSeat(prevTempTicket.ticketId);
              setTempTickets(prev => prev.filter(t => t.ticketId !== prevTempTicket.ticketId));
              onSeatToggle(prevSeatId);
            }
          }

          // Validate seat availability only when selecting
          const validation = await seatsApi.validateSeat(parseInt(seatId), scheduleId);
          if (!validation.available) {
            throw new Error('This seat is no longer available');
          }

          // Create a new temp ticket
          const { ticketId } = await seatsApi.selectSeat(parseInt(seatId), scheduleId);
          setTempTickets(prev => [...prev, { ticketId, seatId: parseInt(seatId), row: 0 }]);
          onSeatToggle(seatId);
        }
      })();

      await withLoading(togglePromise);
      setError(null);
    } catch (err) {
      console.error('Seat toggle error:', err);
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
                          disabled={disabled || globalLoading || !seat.available}
                          className={`w-8 h-8 rounded-t-lg text-xs font-medium transition-colors
                            ${
                              isSelected
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : seat.available
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
                            ${disabled || globalLoading ? 'opacity-50 cursor-not-allowed' : ''}
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
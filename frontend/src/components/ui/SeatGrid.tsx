interface SeatGridProps {
  selectedSeats: string[]
  onSeatToggle: (seatId: string) => void
  disabled?: boolean
}

// Generate a 6x8 seat grid layout
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8]

export function SeatGrid({ selectedSeats, onSeatToggle, disabled = false }: SeatGridProps) {
  return (
    <div className="space-y-4">
      {/* Screen indicator */}
      <div className="relative">
        <div className="h-2 bg-gray-300 rounded-lg w-3/4 mx-auto" />
        <p className="text-center text-sm text-gray-500 mt-2">Screen</p>
      </div>

      {/* Seat grid */}
      <div className="grid gap-4">
        {ROWS.map((row) => (
          <div key={row} className="flex justify-center gap-2">
            <span className="w-6 text-center text-sm text-gray-500">{row}</span>
            {COLUMNS.map((col) => {
              const seatId = `${row}${col}`
              const isSelected = selectedSeats.includes(seatId)

              return (
                <button
                  key={seatId}
                  type="button"
                  onClick={() => onSeatToggle(seatId)}
                  disabled={disabled}
                  className={`w-8 h-8 rounded-t-lg text-xs font-medium transition-colors
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {col}
                </button>
              )
            })}
            <span className="w-6" />
          </div>
        ))}
      </div>

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
      </div>
    </div>
  )
}
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, startOfWeek } from 'date-fns'

interface WeekSliderProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function WeekSlider({ selectedDate, onDateSelect }: WeekSliderProps) {
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))

  const handlePrevWeek = () => {
    onDateSelect(addDays(startOfCurrentWeek, -7))
  }

  const handleNextWeek = () => {
    onDateSelect(addDays(startOfCurrentWeek, 7))
  }

  return (
    <div className="flex items-center justify-between space-x-4 bg-white p-4 rounded-lg border border-blue-100 mb-6">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevWeek}
        className="text-blue-600"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex-1 grid grid-cols-7 gap-1">
        {weekDays.map((date) => {
          const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
          return (
            <Button
              key={date.toISOString()}
              variant={isSelected ? "default" : "ghost"}
              className={`
                flex flex-col items-center p-2 h-auto
                ${isSelected ? 'bg-blue-600 text-white' : 'text-blue-800 hover:bg-blue-50'}
              `}
              onClick={() => onDateSelect(date)}
            >
              <span className="text-xs font-medium">
                {format(date, 'EEE')}
              </span>
              <span className="text-lg">
                {format(date, 'd')}
              </span>
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextWeek}
        className="text-blue-600"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DIAS_SEMANA } from '@/lib/constants'

interface CalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  minDate?: Date
  blockedDates?: string[] // ISO date strings
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  blockedDates = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  // Generate calendar days
  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const isBlocked = (day: number) => {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    return blockedDates.includes(dateStr)
  }

  const isPast = (day: number) => {
    const date = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isBeforeMin = (day: number) => {
    const date = new Date(year, month, day)
    const min = new Date(minDate)
    min.setHours(0, 0, 0, 0)
    return date < min
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    )
  }

  const handleDayClick = (day: number) => {
    if (isPast(day) || isBlocked(day) || isBeforeMin(day)) return
    onDateSelect(new Date(year, month, day))
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-dark-400" />
        </button>
        <h3 className="font-semibold text-dark-100">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-dark-400" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_SEMANA.map((dia) => (
          <div
            key={dia.value}
            className="text-center text-xs text-dark-500 py-2"
          >
            {dia.corto}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day && (
              <button
                onClick={() => handleDayClick(day)}
                disabled={isPast(day) || isBlocked(day) || isBeforeMin(day)}
                className={`w-full h-full flex items-center justify-center rounded-lg text-sm transition-all ${
                  isSelected(day)
                    ? 'bg-primary-400 text-dark-900 font-semibold'
                    : isPast(day) || isBlocked(day) || isBeforeMin(day)
                    ? 'text-dark-600 cursor-not-allowed'
                    : 'text-dark-200 hover:bg-dark-800'
                }`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

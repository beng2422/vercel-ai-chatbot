'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { ActivityGraph } from '@/components/dashboard-charts'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-semibold text-gray-800">Calendar View</h1>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-medium text-gray-700">
              Selected: {date?.toDateString()}
            </h2>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => console.log('Edit report for:', date)}
            >
              Edit Report
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">Monthly Progress</h2>
          <ActivityGraph />
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-600">Reports This Month</p>
              <p className="mt-2 text-3xl font-bold text-blue-700">18</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-600">Completion Rate</p>
              <p className="mt-2 text-3xl font-bold text-green-700">85%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
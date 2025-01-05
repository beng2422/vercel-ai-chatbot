import { ActivityGraph, TaskDistributionChart } from '@/components/dashboard-charts'

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Daily Report Dashboard</h1>
          <p className="text-lg text-gray-600">
            Track your progress and manage your daily activities
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Activity Overview</h2>
            <ActivityGraph />
          </div>
          
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Task Distribution</h2>
            <TaskDistributionChart />
          </div>
          
          <div className="rounded-xl border bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Quick Stats</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-600">Tasks Completed</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">24</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm font-medium text-green-600">Goals Achieved</p>
                <p className="mt-2 text-3xl font-bold text-green-700">8</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4">
                <p className="text-sm font-medium text-purple-600">Streak Days</p>
                <p className="mt-2 text-3xl font-bold text-purple-700">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

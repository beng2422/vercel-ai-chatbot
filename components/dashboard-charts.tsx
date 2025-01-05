'use client'

import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function ActivityGraph() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [8, 12, 5, 9, 11, 4, 7],
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Weekly Activity'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return <Line data={data} options={options} />
}

export function TaskDistributionChart() {
  const data = {
    labels: ['Completed', 'In Progress', 'Planned', 'Backlog'],
    datasets: [
      {
        data: [65, 20, 10, 5],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(147, 197, 253)',
          'rgb(191, 219, 254)',
          'rgb(219, 234, 254)'
        ]
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      title: {
        display: true,
        text: 'Task Distribution'
      }
    }
  }

  return <Bar data={data} options={options} />
} 
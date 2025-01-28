import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { IconChartLine } from '@tabler/icons-react'
import { useTaskStore } from '../../store/taskStore'
import { formatTime } from '../../utils'
import { CHART_CONFIG, THEME } from '../../constants'
import { Task } from '../../types'

interface ChartData {
  name: string
  completed: number
  estimated: number
  date: string
}

interface PieData {
  name: string
  value: number
  color: string
}

function getISODate(date: Date): string {
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }
  const result = date.toISOString().split('T')[0]
  if (!result) {
    throw new Error('Failed to format date')
  }
  return result
}

function getTasksByDate(tasks: Task[], targetDate: string): Task[] {
  return tasks.filter((task) => {
    // Early return if deadline is null
    if (task.deadline === null) return false

    // Now we know deadline is a string
    const taskDate = new Date(task.deadline)
    return !isNaN(taskDate.getTime()) && getISODate(taskDate) === targetDate
  })
}

function getLastSevenDays(): ChartData[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const chartData: ChartData = {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: getISODate(date),
      completed: 0,
      estimated: 0
    }
    return chartData
  }).reverse()
}

export function Analytics() {
  const { tasks } = useTaskStore()

  const stats = useMemo(() => {
    if (!tasks.length) return null

    const completedTasks = tasks.filter((t) => t.status === 'completed')
    const totalTimeSpent = tasks.reduce((acc, t) => acc + t.timeSpent, 0)
    const totalPomos = tasks.reduce((acc, t) => acc + t.actualPomos, 0)
    const estimatedPomos = tasks.reduce((acc, t) => acc + t.estimatedPomos, 0)

    const accuracyScores = completedTasks.map((task) => {
      const estimatedTime = task.estimatedPomos * 25 * 60
      const actualTime = task.timeSpent
      return Math.min(estimatedTime / actualTime, actualTime / estimatedTime)
    })

    const averageAccuracy =
      accuracyScores.length > 0
        ? accuracyScores.reduce((a, b) => a + b) / accuracyScores.length
        : 0

    const completionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0
    const productivityScore = Math.round((averageAccuracy * completionRate * 100 + Number.EPSILON) * 100) / 100

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      totalTimeSpent,
      totalPomos,
      estimatedPomos,
      productivityScore,
      completionRate
    }
  }, [tasks])

  const chartData = useMemo(() => {
    const baseData = getLastSevenDays()

    return baseData.map((dayData) => {
      const dayTasks = getTasksByDate(tasks, dayData.date)
      return {
        ...dayData,
        completed: dayTasks.filter((t) => t.status === 'completed').length,
        estimated: dayTasks.length
      }
    })
  }, [tasks])

  const pieData: PieData[] = useMemo(() => {
    if (!stats) return []

    return [
      { name: 'Completed', value: stats.completedTasks, color: THEME.colors.success },
      {
        name: 'Remaining',
        value: stats.totalTasks - stats.completedTasks,
        color: THEME.colors.warning
      }
    ]
  }, [stats])

  if (!stats) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No data available. Start adding and completing tasks to see analytics.
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400">
        <IconChartLine size={24} aria-hidden="true" />
        <h2 className="text-xl font-bold">Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Productivity Score</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.productivityScore}%
          </div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(stats.completionRate * 100)}%
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Time Spent</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatTime(stats.totalTimeSpent)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Task Completion Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={CHART_CONFIG.margin}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={THEME.colors.success}
                  name="Completed Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="estimated"
                  stroke={THEME.colors.warning}
                  name="Estimated Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Task Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

import { Task } from '../types'

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`
  }

  return `${remainingSeconds}s`
}

function ensureDate(date: string | null | Date): Date {
  if (!date) {
    throw new Error('Invalid date')
  }
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date format')
  }
  return parsed
}

export function formatDate(date: string | null | Date): string {
  if (!date) {
    return 'No date set'
  }

  try {
    return ensureDate(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid date format'
  }
}

export function createCalendarUrl(task: Task): string {
  try {
    if (!task.deadline) {
      return '#'
    }

    const startDate = ensureDate(task.deadline)
    const endDate = new Date(startDate.getTime() + 30 * 60000) // 30 minutes duration

    const formatDateForCalendar = (date: Date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0]

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${
      encodeURIComponent(task.name)
    }&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${
      encodeURIComponent(`Pomodoros: ${task.estimatedPomos}\n${task.description || ''}`)
    }&location=Work Session`
  } catch {
    return '#'
  }
}

export function generateTaskStats(tasks: Task[]) {
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    totalTimeSpent: tasks.reduce((acc, t) => acc + t.timeSpent, 0),
    totalPomos: tasks.reduce((acc, t) => acc + t.actualPomos, 0),
    estimatedPomos: tasks.reduce((acc, t) => acc + t.estimatedPomos, 0),
    productivityScore: calculateProductivityScore(tasks)
  }
}

function calculateProductivityScore(tasks: Task[]): number {
  if (tasks.length === 0) {
    return 0
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed')
  if (completedTasks.length === 0) {
    return 0
  }

  const accuracyScores = completedTasks.map((task) => {
    const estimatedTime = task.estimatedPomos * 25 * 60
    const actualTime = task.timeSpent
    return Math.min(estimatedTime / actualTime, actualTime / estimatedTime)
  })

  const averageAccuracy = accuracyScores.reduce((a, b) => a + b) / accuracyScores.length
  const completionRate = completedTasks.length / tasks.length

  return Math.round((averageAccuracy * completionRate * 100 + Number.EPSILON) * 100) / 100
}

export function safeLocalStorage() {
  return {
    getItem: <T>(key: string, defaultValue: T): T => {
      if (typeof key !== 'string') {
        console.error('Invalid key type:', typeof key)
        return defaultValue
      }

      try {
        const item = localStorage.getItem(key)
        if (!item) {
          return defaultValue
        }

        try {
          return JSON.parse(item) as T
        } catch (parseError) {
          console.error('Error parsing localStorage item:', parseError)
          return defaultValue
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error)
        return defaultValue
      }
    },
    setItem: (key: string, value: unknown): void => {
      if (typeof key !== 'string') {
        console.error('Invalid key type:', typeof key)
        return
      }

      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error('Error writing to localStorage:', error)
      }
    },
    removeItem: (key: string): void => {
      if (typeof key !== 'string') {
        console.error('Invalid key type:', typeof key)
        return
      }

      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error('Error removing from localStorage:', error)
      }
    }
  }
}

export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return Promise.resolve(false)
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve(true)
  }

  if (Notification.permission === 'denied') {
    return Promise.resolve(false)
  }

  return Notification.requestPermission().then((permission) => permission === 'granted')
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    new Notification(title, options)
  }
}

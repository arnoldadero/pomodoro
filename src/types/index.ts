export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export interface Task {
  id: string
  name: string
  priority: 'High' | 'Medium' | 'Low'
  estimatedPomos: number
  actualPomos: number
  timeSpent: number
  description: string
  deadline: string | null // Make deadline explicitly nullable
  labels: string[]
  calendarEventId?: string
  status: 'todo' | 'in-progress' | 'completed'
  createdAt: string // Add createdAt field for better date handling
}

export type ToastType = 'error' | 'success' | 'warning'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

export interface TimerState {
  timeLeft: number
  isRunning: boolean
  mode: TimerMode
  workCount: number
}

export interface TaskState {
  tasks: Task[]
  activeTaskId: string | null
}

export interface SettingsState {
  darkMode: boolean
  spotifyTrack: string
  volume: number
}

export type ValidationResult = {
  isValid: boolean
  errors: string[]
}

// Add date utility types
export interface DateRange {
  start: string
  end: string
}

export const TIMER_DURATIONS = {
  work: 25 * 60, // 25 minutes in seconds
  shortBreak: 5 * 60, // 5 minutes in seconds
  longBreak: 15 * 60 // 15 minutes in seconds
} as const

export const POMOS_BEFORE_LONG_BREAK = 4

export const NOTIFICATION_DURATION = 5000 // 5 seconds in milliseconds

export const TASK_PRIORITIES = Object.freeze(['High', 'Medium', 'Low'] as const)

export const TASK_STATUS = Object.freeze(['todo', 'in-progress', 'completed'] as const)

export const AUDIO_PATHS = {
  tick: '/tick.mp3',
  notification: '/notification.mp3'
} as const

export const LOCAL_STORAGE_KEYS = {
  tasks: 'pomodoro-tasks',
  settings: 'pomodoro-settings',
  theme: 'theme'
} as const

export const ERROR_MESSAGES = {
  emptyTaskName: 'Task name cannot be empty',
  invalidPomos: 'Estimated Pomodoros must be a positive number',
  missingPriority: 'Priority must be selected',
  audioPlayback: 'Error playing audio',
  localStorage: {
    read: 'Error reading from localStorage',
    write: 'Error writing to localStorage',
    remove: 'Error removing from localStorage'
  }
} as const

export const THEME = {
  colors: {
    primary: 'indigo',
    error: '#dc2626',
    success: '#16a34a',
    warning: '#ca8a04'
  },
  priorities: {
    High: 'red',
    Medium: 'yellow',
    Low: 'green'
  }
} as const

export const CHART_CONFIG = {
  height: 300,
  margin: { top: 20, right: 20, bottom: 20, left: 20 }
} as const

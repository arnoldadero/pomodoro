import {
  formatTime,
  formatDate,
  createCalendarUrl,
  generateTaskStats,
  safeLocalStorage,
  requestNotificationPermission,
  showNotification
} from '@/utils'
import { Task } from '@/types'

describe('formatTime', () => {
  it('should format seconds only', () => {
    expect(formatTime(45)).toBe('45s')
    expect(formatTime(5)).toBe('5s')
    expect(formatTime(0)).toBe('0s')
  })

  it('should format minutes and seconds', () => {
    expect(formatTime(65)).toBe('1m 05s')
    expect(formatTime(130)).toBe('2m 10s')
    expect(formatTime(3599)).toBe('59m 59s')
  })

  it('should format hours and minutes', () => {
    expect(formatTime(3600)).toBe('1h 00m')
    expect(formatTime(7200)).toBe('2h 00m')
    expect(formatTime(3661)).toBe('1h 01m')
  })
})

describe('formatDate', () => {
  beforeAll(() => {
    // Mock toLocaleDateString to ensure consistent output
    const mockDate = new Date('2024-01-28T09:00:00')
    jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function(this: Date) {
      return mockDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should handle null dates', () => {
    expect(formatDate(null)).toBe('No date set')
  })

  it('should format date string', () => {
    expect(formatDate('2024-01-28T09:00:00')).toBe('Sun, Jan 28, 09:00 AM')
  })

  it('should format Date object', () => {
    expect(formatDate(new Date('2024-01-28T09:00:00'))).toBe('Sun, Jan 28, 09:00 AM')
  })
})

describe('createCalendarUrl', () => {
  const mockTask: Task = {
    id: '1',
    name: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    estimatedPomos: 2,
    actualPomos: 0,
    timeSpent: 0,
    deadline: '2024-01-28T09:00:00',
    labels: [],
    status: 'todo',
    createdAt: new Date().toISOString()
  }

  it('should return # for tasks without deadline', () => {
    const taskWithoutDeadline = { ...mockTask, deadline: null }
    expect(createCalendarUrl(taskWithoutDeadline)).toBe('#')
  })

  it('should create valid calendar URL', () => {
    const url = createCalendarUrl(mockTask)
    expect(url).toContain('calendar.google.com/calendar/render')
    expect(url).toContain(encodeURIComponent(mockTask.name))
    expect(url).toContain(encodeURIComponent(`Pomodoros: ${mockTask.estimatedPomos}`))
    expect(url).toContain(encodeURIComponent(mockTask.description))
  })

  it('should set end time 30 minutes after start time', () => {
    const url = createCalendarUrl(mockTask)
    const urlParams = new URLSearchParams(url.split('?')[1])
    const dates = urlParams.get('dates')?.split('/')
    const startDate = new Date(mockTask.deadline as string)
    const endDate = new Date(startDate.getTime() + 30 * 60000)

    expect(dates?.[0]).toBe(startDate.toISOString().replace(/[-:]/g, '').split('.')[0])
    expect(dates?.[1]).toBe(endDate.toISOString().replace(/[-:]/g, '').split('.')[0])
  })
})

describe('generateTaskStats', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Task 1',
      priority: 'High',
      estimatedPomos: 2,
      actualPomos: 1,
      timeSpent: 1500,
      description: '',
      deadline: null,
      labels: [],
      status: 'completed',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Task 2',
      priority: 'Medium',
      estimatedPomos: 3,
      actualPomos: 2,
      timeSpent: 3000,
      description: '',
      deadline: null,
      labels: [],
      status: 'todo',
      createdAt: new Date().toISOString()
    }
  ]

  it('should calculate correct statistics', () => {
    const stats = generateTaskStats(mockTasks)
    expect(stats).toEqual({
      totalTasks: 2,
      completedTasks: 1,
      totalTimeSpent: 4500,
      totalPomos: 3,
      estimatedPomos: 5,
      productivityScore: expect.any(Number)
    })
  })

  it('should handle empty task list', () => {
    const stats = generateTaskStats([])
    expect(stats).toEqual({
      totalTasks: 0,
      completedTasks: 0,
      totalTimeSpent: 0,
      totalPomos: 0,
      estimatedPomos: 0,
      productivityScore: 0
    })
  })
})

describe('safeLocalStorage', () => {
  const storage = safeLocalStorage()
  const mockData = { key: 'value' }
  const mockError = new Error('localStorage error')

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('should get and set items safely', () => {
    storage.setItem('test', mockData)
    expect(storage.getItem('test', null)).toEqual(mockData)
  })

  it('should return default value when item not found', () => {
    expect(storage.getItem('nonexistent', 'default')).toBe('default')
  })

  it('should handle localStorage errors', () => {
    jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw mockError
    })
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw mockError
    })
    jest.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw mockError
    })

    storage.setItem('test', mockData)
    expect(console.error).toHaveBeenCalledWith('Error writing to localStorage:', mockError)

    storage.getItem('test', null)
    expect(console.error).toHaveBeenCalledWith('Error reading from localStorage:', mockError)

    storage.removeItem('test')
    expect(console.error).toHaveBeenCalledWith('Error removing from localStorage:', mockError)
  })
})

describe('notifications', () => {
  describe('requestNotificationPermission', () => {
    beforeEach(() => {
      // Reset Notification API
      Object.defineProperty(window, 'Notification', {
        value: undefined,
        writable: true
      })
    })

    it('should handle unsupported browsers', async () => {
      expect(await requestNotificationPermission()).toBe(false)
    })

    it('should return true for granted permission', async () => {
      Object.defineProperty(window, 'Notification', {
        value: class {
          static permission = 'granted'
          static requestPermission = jest.fn().mockResolvedValue('granted')
        },
        writable: true
      })
      expect(await requestNotificationPermission()).toBe(true)
    })

    it('should return false for denied permission', async () => {
      Object.defineProperty(window, 'Notification', {
        value: class {
          static permission = 'denied'
          static requestPermission = jest.fn().mockResolvedValue('denied')
        },
        writable: true
      })
      expect(await requestNotificationPermission()).toBe(false)
    })
  })

  describe('showNotification', () => {
    let originalNotification: typeof Notification

    beforeAll(() => {
      originalNotification = window.Notification
    })

    afterAll(() => {
      window.Notification = originalNotification
    })

    it('should show notification when permission is granted', () => {
      const mockNotification = jest.fn()
      Object.defineProperty(window, 'Notification', {
        value: class {
          static permission = 'granted'
          constructor(public title: string, public options?: NotificationOptions) {
            mockNotification(title, options)
          }
        },
        writable: true
      })

      showNotification('Test', { body: 'Test body' })
      expect(mockNotification).toHaveBeenCalledWith('Test', { body: 'Test body' })
    })

    it('should not show notification when permission is denied', () => {
      const mockNotification = jest.fn()
      Object.defineProperty(window, 'Notification', {
        value: class {
          static permission = 'denied'
          constructor(public title: string, public options?: NotificationOptions) {
            mockNotification(title, options)
          }
        },
        writable: true
      })

      showNotification('Test')
      expect(mockNotification).not.toHaveBeenCalled()
    })
  })
})

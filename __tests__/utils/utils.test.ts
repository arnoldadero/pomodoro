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
  beforeEach(() => {
    jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function(this: Date) {
      const locales = arguments[0]
      const options = arguments[1] as Intl.DateTimeFormatOptions | undefined

      if (
        locales === 'en-US' &&
        options?.weekday === 'short' &&
        options?.month === 'short' &&
        options?.day === 'numeric' &&
        options?.hour === '2-digit' &&
        options?.minute === '2-digit'
      ) {
        return 'Sun, Jan 28, 09:00 AM'
      }
      return this.toLocaleDateString()
    })
  })

  afterEach(() => {
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

  it('should handle invalid date strings', () => {
    expect(formatDate('invalid-date')).toBe('Invalid date format')
  })

  it('should handle invalid Date objects', () => {
    expect(formatDate(new Date('invalid'))).toBe('Invalid date format')
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

  it('should handle invalid deadline dates', () => {
    const taskWithInvalidDeadline = { ...mockTask, deadline: 'invalid-date' }
    expect(createCalendarUrl(taskWithInvalidDeadline)).toBe('#')
  })

  it('should create valid calendar URL', () => {
    const url = createCalendarUrl(mockTask)
    expect(url).toContain('calendar.google.com/calendar/render')
    expect(url).toContain(encodeURIComponent(mockTask.name))
    expect(url).toContain(encodeURIComponent(`Pomodoros: ${mockTask.estimatedPomos}`))
    expect(url).toContain(encodeURIComponent(mockTask.description))
  })

  it('should handle empty description', () => {
    const taskWithoutDescription = { ...mockTask, description: '' }
    const url = createCalendarUrl(taskWithoutDescription)
    expect(url).toContain(encodeURIComponent(`Pomodoros: ${mockTask.estimatedPomos}\n`))
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

  describe('getItem', () => {
    it('should get items safely', () => {
      storage.setItem('test', mockData)
      expect(storage.getItem('test', null)).toEqual(mockData)
    })

    it('should return default value when item not found', () => {
      expect(storage.getItem('nonexistent', 'default')).toBe('default')
    })

    it('should handle invalid JSON data', () => {
      localStorage.setItem('invalid', 'invalid-json')
      expect(storage.getItem('invalid', 'default')).toBe('default')
      expect(console.error).toHaveBeenCalledWith('Error parsing localStorage item:', expect.any(Error))
    })
  })

  describe('setItem', () => {
    it('should handle localStorage errors', () => {
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw mockError
      })
      storage.setItem('test', mockData)
      expect(console.error).toHaveBeenCalledWith('Error writing to localStorage:', mockError)
    })

    it('should handle non-string keys', () => {
      // @ts-expect-error Testing invalid key type
      storage.setItem(123, mockData)
      expect(console.error).toHaveBeenCalledWith('Invalid key type:', 'number')
    })
  })

  describe('removeItem', () => {
    it('should handle localStorage errors', () => {
      jest.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw mockError
      })
      storage.removeItem('test')
      expect(console.error).toHaveBeenCalledWith('Error removing from localStorage:', mockError)
    })

    it('should handle non-string keys', () => {
      // @ts-expect-error Testing invalid key type
      storage.removeItem(123)
      expect(console.error).toHaveBeenCalledWith('Invalid key type:', 'number')
    })
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
    let mockNotification: jest.Mock

    beforeAll(() => {
      originalNotification = window.Notification
    })

    beforeEach(() => {
      mockNotification = jest.fn()
    })

    afterAll(() => {
      window.Notification = originalNotification
    })

    afterEach(() => {
      mockNotification.mockClear()
    })

    it('should show notification when permission is granted', () => {
      Object.defineProperty(window, 'Notification', {
        value: class {
          static permission = 'granted'
          constructor(title: string, options?: NotificationOptions) {
            mockNotification(title, options)
          }
        },
        writable: true
      })

      showNotification('Test', { body: 'Test body' })
      expect(mockNotification).toHaveBeenCalledWith('Test', { body: 'Test body' })
    })

    it('should not show notification when permission is denied', () => {
      Object.defineProperty(window, 'Notification', {
        value: class {
          static permission = 'denied'
          constructor(title: string, options?: NotificationOptions) {
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

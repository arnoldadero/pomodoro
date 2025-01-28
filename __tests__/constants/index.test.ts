import {
  TIMER_DURATIONS,
  POMOS_BEFORE_LONG_BREAK,
  NOTIFICATION_DURATION,
  TASK_PRIORITIES,
  TASK_STATUS,
  AUDIO_PATHS,
  LOCAL_STORAGE_KEYS,
  ERROR_MESSAGES,
  THEME,
  CHART_CONFIG
} from '../../src/constants'

describe('constants/index', () => {
  describe('TIMER_DURATIONS', () => {
    it('should have correct duration values in seconds', () => {
      expect(TIMER_DURATIONS.work).toBe(25 * 60)
      expect(TIMER_DURATIONS.shortBreak).toBe(5 * 60)
      expect(TIMER_DURATIONS.longBreak).toBe(15 * 60)
    })
  })

  it('should have correct POMOS_BEFORE_LONG_BREAK value', () => {
    expect(POMOS_BEFORE_LONG_BREAK).toBe(4)
  })

  it('should have correct NOTIFICATION_DURATION value in milliseconds', () => {
    expect(NOTIFICATION_DURATION).toBe(5000)
  })

  describe('TASK_PRIORITIES', () => {
    it('should have correct priority values', () => {
      expect(TASK_PRIORITIES).toEqual(['High', 'Medium', 'Low'])
    })

    it('should be readonly array', () => {
      expect(Object.isFrozen(TASK_PRIORITIES)).toBe(true)
    })
  })

  describe('TASK_STATUS', () => {
    it('should have correct status values', () => {
      expect(TASK_STATUS).toEqual(['todo', 'in-progress', 'completed'])
    })

    it('should be readonly array', () => {
      expect(Object.isFrozen(TASK_STATUS)).toBe(true)
    })
  })

  describe('AUDIO_PATHS', () => {
    it('should have correct audio file paths', () => {
      expect(AUDIO_PATHS.tick).toBe('/tick.mp3')
      expect(AUDIO_PATHS.notification).toBe('/notification.mp3')
    })
  })

  describe('LOCAL_STORAGE_KEYS', () => {
    it('should have correct storage keys', () => {
      expect(LOCAL_STORAGE_KEYS.tasks).toBe('pomodoro-tasks')
      expect(LOCAL_STORAGE_KEYS.settings).toBe('pomodoro-settings')
      expect(LOCAL_STORAGE_KEYS.theme).toBe('theme')
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should have correct error messages', () => {
      expect(ERROR_MESSAGES.emptyTaskName).toBe('Task name cannot be empty')
      expect(ERROR_MESSAGES.invalidPomos).toBe('Estimated Pomodoros must be a positive number')
      expect(ERROR_MESSAGES.missingPriority).toBe('Priority must be selected')
      expect(ERROR_MESSAGES.audioPlayback).toBe('Error playing audio')
      expect(ERROR_MESSAGES.localStorage.read).toBe('Error reading from localStorage')
      expect(ERROR_MESSAGES.localStorage.write).toBe('Error writing to localStorage')
      expect(ERROR_MESSAGES.localStorage.remove).toBe('Error removing from localStorage')
    })
  })

  describe('THEME', () => {
    it('should have correct color values', () => {
      expect(THEME.colors.primary).toBe('indigo')
      expect(THEME.colors.error).toBe('red')
      expect(THEME.colors.success).toBe('green')
      expect(THEME.colors.warning).toBe('yellow')
    })

    it('should have correct priority colors', () => {
      expect(THEME.priorities.High).toBe('red')
      expect(THEME.priorities.Medium).toBe('yellow')
      expect(THEME.priorities.Low).toBe('green')
    })
  })

  describe('CHART_CONFIG', () => {
    it('should have correct chart configuration', () => {
      expect(CHART_CONFIG.height).toBe(300)
      expect(CHART_CONFIG.margin).toEqual({
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      })
    })
  })
})

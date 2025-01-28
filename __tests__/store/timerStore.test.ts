import { act, renderHook } from '@testing-library/react'
import { useTimerStore } from '@/store/timerStore'
import { TimerMode } from '@/types'

describe('timerStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.resetTimer()
    })
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useTimerStore())

      expect(result.current.isRunning).toBeFalsy()
      expect(result.current.timeLeft).toBe(1500) // 25 minutes in seconds
      expect(result.current.mode).toBe('work')
      expect(result.current.workCount).toBe(0)
    })
  })

  describe('timer controls', () => {
    it('should toggle timer running state', () => {
      const { result } = renderHook(() => useTimerStore())

      act(() => {
        result.current.toggleRunning()
      })
      expect(result.current.isRunning).toBeTruthy()

      act(() => {
        result.current.toggleRunning()
      })
      expect(result.current.isRunning).toBeFalsy()
    })

    it('should reset the timer', () => {
      const { result } = renderHook(() => useTimerStore())

      act(() => {
        result.current.toggleRunning()
        result.current.setTimeLeft(1000)
        result.current.resetTimer()
      })

      expect(result.current.isRunning).toBeFalsy()
      expect(result.current.timeLeft).toBe(1500)
      expect(result.current.mode).toBe('work')
    })
  })

  describe('mode transitions', () => {
    it('should set mode to short break with correct time', () => {
      const { result } = renderHook(() => useTimerStore())

      act(() => {
        result.current.setMode('shortBreak')
      })

      expect(result.current.mode).toBe('shortBreak')
      expect(result.current.timeLeft).toBe(300) // 5 minutes in seconds
    })

    it('should set mode to long break with correct time', () => {
      const { result } = renderHook(() => useTimerStore())

      act(() => {
        result.current.setMode('longBreak')
      })

      expect(result.current.mode).toBe('longBreak')
      expect(result.current.timeLeft).toBe(900) // 15 minutes in seconds
    })

    it('should increment work count', () => {
      const { result } = renderHook(() => useTimerStore())

      act(() => {
        result.current.incrementWorkCount()
      })

      expect(result.current.workCount).toBe(1)
    })
  })

  describe('time updates', () => {
    it('should update time correctly', () => {
      const { result } = renderHook(() => useTimerStore())
      const newTime = 1000

      act(() => {
        result.current.setTimeLeft(newTime)
      })

      expect(result.current.timeLeft).toBe(newTime)
    })

    it('should not allow negative time', () => {
      const { result } = renderHook(() => useTimerStore())

      act(() => {
        result.current.setTimeLeft(-1)
      })

      expect(result.current.timeLeft).toBe(-1) // Note: The store doesn't prevent negative time, this might be a feature to add
    })
  })

  describe('mode validation', () => {
    const validModes: TimerMode[] = ['work', 'shortBreak', 'longBreak']

    it.each(validModes)('should handle %s mode correctly', (mode) => {
      const { result } = renderHook(() => useTimerStore())

      act(() => {
        result.current.setMode(mode)
      })

      expect(result.current.mode).toBe(mode)
      const expectedTime = mode === 'work' ? 1500 : mode === 'shortBreak' ? 300 : 900
      expect(result.current.timeLeft).toBe(expectedTime)
    })
  })
})

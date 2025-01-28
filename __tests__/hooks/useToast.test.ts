import { renderHook, act } from '@testing-library/react'
import { useToast } from '@/hooks/useToast'
import { ToastType } from '@/types'

describe('useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('adding toasts', () => {
    it('should add a toast with default type', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.addToast('Test message')
      })

      const toasts = result.current.toasts
      expect(toasts).toHaveLength(1)

      const toast = toasts[0]
      expect(toast).toBeDefined()
      if (toast) {
        expect(toast).toEqual({
          id: expect.any(Number),
          message: 'Test message',
          type: 'error'
        })
      }
    })

    it('should add multiple toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.addToast('First message')
        result.current.addToast('Second message', 'success')
      })

      const toasts = result.current.toasts
      expect(toasts).toHaveLength(2)

      const [firstToast, secondToast] = toasts
      expect(firstToast?.message).toBe('First message')
      expect(secondToast?.message).toBe('Second message')
    })

    it.each(['error', 'success', 'warning'] as ToastType[])(
      'should add toast with %s type',
      (type) => {
        const { result } = renderHook(() => useToast())

        act(() => {
          result.current.addToast(`${type} message`, type)
        })

        const toasts = result.current.toasts
        expect(toasts).toHaveLength(1)

        const toast = toasts[0]
        expect(toast).toBeDefined()
        if (toast) {
          expect(toast).toEqual({
            id: expect.any(Number),
            message: `${type} message`,
            type
          })
        }
      }
    )
  })

  describe('removing toasts', () => {
    it('should remove a specific toast', () => {
      const { result } = renderHook(() => useToast())
      let toastId: number

      act(() => {
        toastId = result.current.addToast('Test message')
      })

      const toasts = result.current.toasts
      expect(toasts).toHaveLength(1)

      act(() => {
        result.current.removeToast(toastId)
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should auto-dismiss toast after 5 seconds', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.addToast('Test message')
      })

      expect(result.current.toasts).toHaveLength(1)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should clear all toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.addToast('First message')
        result.current.addToast('Second message')
        result.current.addToast('Third message')
      })

      expect(result.current.toasts).toHaveLength(3)

      act(() => {
        result.current.clearToasts()
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })

  describe('toast state management', () => {
    it('should maintain correct order of toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.addToast('First')
        result.current.addToast('Second')
        result.current.addToast('Third')
      })

      const messages = result.current.toasts.map(t => t.message)
      expect(messages).toEqual(['First', 'Second', 'Third'])
    })

    it('should handle removing non-existent toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.addToast('Test')
      })

      act(() => {
        result.current.removeToast(999) // Non-existent ID
      })

      expect(result.current.toasts).toHaveLength(1)
    })

    it('should handle multiple auto-dismissals correctly', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.addToast('First')
        result.current.addToast('Second')
      })

      expect(result.current.toasts).toHaveLength(2)

      // Advance time for first toast
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      const remainingToasts = result.current.toasts
      expect(remainingToasts).toHaveLength(1)
      const lastToast = remainingToasts[0]
      expect(lastToast?.message).toBe('Second')

      // Advance time for second toast
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })
})

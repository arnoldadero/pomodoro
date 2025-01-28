import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useTimerStore } from '@/store/timerStore'
import { useTaskStore } from '@/store/taskStore'
import { Task, TimerState, TaskState } from '@/types'
import { Mock } from 'jest-mock'

// Mock the stores
jest.mock('@/store/timerStore', () => ({
  __esModule: true,
  useTimerStore: jest.fn()
}))

jest.mock('@/store/taskStore', () => ({
  __esModule: true,
  useTaskStore: jest.fn()
}))

// Mock focus function
const mockFocus = jest.fn()
Object.defineProperty(global.document, 'getElementById', {
  value: jest.fn(() => ({
    focus: mockFocus
  }))
})

describe('useKeyboardShortcuts', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Task 1',
      priority: 'High',
      estimatedPomos: 1,
      actualPomos: 0,
      timeSpent: 0,
      description: '',
      deadline: null,
      labels: [],
      status: 'todo',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Task 2',
      priority: 'Medium',
      estimatedPomos: 2,
      actualPomos: 0,
      timeSpent: 0,
      description: '',
      deadline: null,
      labels: [],
      status: 'todo',
      createdAt: new Date().toISOString()
    }
  ]

  const mockTimerStore = {
    isRunning: false,
    toggleRunning: jest.fn(),
    resetTimer: jest.fn(),
    mode: 'work' as const,
    workCount: 0,
    timeLeft: 1500
  }

  const mockTaskStore = {
    tasks: mockTasks,
    activeTaskId: null as string | null,
    setActiveTask: jest.fn()
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    // Cast the mock functions to unknown first
    ;((useTimerStore as unknown) as Mock).mockReturnValue(mockTimerStore)
    ;((useTaskStore as unknown) as Mock).mockReturnValue(mockTaskStore)
  })

  const simulateKeyPress = (key: string, target?: Partial<HTMLElement>) => {
    const event = new KeyboardEvent('keydown', { key })
    Object.defineProperty(event, 'target', {
      value: target || document.body,
      enumerable: true
    })
    window.dispatchEvent(event)
  }

  describe('timer controls', () => {
    it('should toggle timer on space key', () => {
      renderHook(() => useKeyboardShortcuts())
      simulateKeyPress(' ')
      expect(mockTimerStore.toggleRunning).toHaveBeenCalled()
    })

    it('should reset timer on escape key', () => {
      renderHook(() => useKeyboardShortcuts())
      simulateKeyPress('Escape')
      expect(mockTimerStore.resetTimer).toHaveBeenCalled()
    })
  })

  describe('input field handling', () => {
    it('should ignore shortcuts when typing in input fields', () => {
      renderHook(() => useKeyboardShortcuts())

      // Test with different form elements
      const elements = [
        { type: 'text', constructor: HTMLInputElement },
        { type: 'textarea', constructor: HTMLTextAreaElement },
        { type: 'select', constructor: HTMLSelectElement }
      ]

      elements.forEach(({ type, constructor }) => {
        const element = { tagName: type.toUpperCase(), constructor }
        simulateKeyPress(' ', element)
        expect(mockTimerStore.toggleRunning).not.toHaveBeenCalled()
      })
    })

    it('should focus name input on N key', () => {
      renderHook(() => useKeyboardShortcuts())
      simulateKeyPress('n')
      expect(document.getElementById).toHaveBeenCalledWith('name')
      expect(mockFocus).toHaveBeenCalled()
    })
  })

  describe('task navigation', () => {
    it('should select first task when no task is active', () => {
      renderHook(() => useKeyboardShortcuts())
      simulateKeyPress('f')
      expect(mockTaskStore.setActiveTask).toHaveBeenCalledWith('1')
    })

    it('should cycle through tasks', () => {
      Object.assign(mockTaskStore, { activeTaskId: '1' })
      renderHook(() => useKeyboardShortcuts())
      simulateKeyPress('f')
      expect(mockTaskStore.setActiveTask).toHaveBeenCalledWith('2')

      // Test cycling back to first task
      Object.assign(mockTaskStore, { activeTaskId: '2' })
      simulateKeyPress('f')
      expect(mockTaskStore.setActiveTask).toHaveBeenCalledWith('1')
    })

    it('should do nothing when no tasks exist', () => {
      Object.assign(mockTaskStore, { tasks: [] })
      renderHook(() => useKeyboardShortcuts())
      simulateKeyPress('f')
      expect(mockTaskStore.setActiveTask).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useKeyboardShortcuts())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })
  })
})

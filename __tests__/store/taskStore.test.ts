import { act, renderHook } from '@testing-library/react'
import { useTaskStore } from '@/store/taskStore'
import { Task } from '@/types'

describe('taskStore', () => {
  const mockTask: Task = {
    id: '1',
    name: 'Test Task',
    priority: 'High',
    estimatedPomos: 2,
    actualPomos: 0,
    timeSpent: 0,
    description: 'Test description',
    deadline: null,
    labels: ['test'],
    status: 'todo',
    createdAt: new Date().toISOString()
  }

  beforeEach(() => {
    const { result } = renderHook(() => useTaskStore())
    // Clear the persisted state
    act(() => {
      result.current.tasks.forEach(task => {
        result.current.removeTask(task.id)
      })
    })
  })

  describe('task validation', () => {
    it('should validate required fields', () => {
      const { result } = renderHook(() => useTaskStore())

      const invalidTask: Partial<Task> = {
        id: '2',
        name: '',
        priority: undefined,
        estimatedPomos: 0
      }

      const validation = result.current.validateTask(invalidTask)
      expect(validation.isValid).toBeFalsy()
      expect(validation.errors).toContain('Task name cannot be empty')
      expect(validation.errors).toContain('Estimated Pomodoros must be a positive number')
      expect(validation.errors).toContain('Priority must be selected')
    })

    it('should validate a correct task', () => {
      const { result } = renderHook(() => useTaskStore())

      const validation = result.current.validateTask(mockTask)
      expect(validation.isValid).toBeTruthy()
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('task operations', () => {
    it('should add a valid task', () => {
      const { result } = renderHook(() => useTaskStore())

      act(() => {
        const success = result.current.addTask(mockTask)
        expect(success).toBeTruthy()
      })

      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0]).toEqual(mockTask)
    })

    it('should not add an invalid task', () => {
      const { result } = renderHook(() => useTaskStore())

      const invalidTask = { ...mockTask, name: '' }
      act(() => {
        const success = result.current.addTask(invalidTask)
        expect(success).toBeFalsy()
      })

      expect(result.current.tasks).toHaveLength(0)
    })

    it('should update an existing task', () => {
      const { result } = renderHook(() => useTaskStore())

      act(() => {
        result.current.addTask(mockTask)
      })

      const updatedTask = { ...mockTask, name: 'Updated Task' }
      act(() => {
        result.current.updateTask(updatedTask)
      })

      const updatedTaskFromStore = result.current.tasks.find(t => t.id === mockTask.id)
      expect(updatedTaskFromStore).toBeDefined()
      expect(updatedTaskFromStore?.name).toBe('Updated Task')
    })

    it('should remove a task', () => {
      const { result } = renderHook(() => useTaskStore())

      act(() => {
        result.current.addTask(mockTask)
      })
      expect(result.current.tasks).toHaveLength(1)

      act(() => {
        result.current.removeTask(mockTask.id)
      })
      expect(result.current.tasks).toHaveLength(0)
    })
  })

  describe('active task management', () => {
    it('should set active task', () => {
      const { result } = renderHook(() => useTaskStore())

      act(() => {
        result.current.addTask(mockTask)
        result.current.setActiveTask(mockTask.id)
      })

      expect(result.current.activeTaskId).toBe(mockTask.id)
    })

    it('should clear active task when removing active task', () => {
      const { result } = renderHook(() => useTaskStore())

      act(() => {
        result.current.addTask(mockTask)
        result.current.setActiveTask(mockTask.id)
      })
      expect(result.current.activeTaskId).toBe(mockTask.id)

      act(() => {
        result.current.removeTask(mockTask.id)
      })
      expect(result.current.activeTaskId).toBeNull()
    })

    it('should keep active task when removing different task', () => {
      const { result } = renderHook(() => useTaskStore())
      const otherTask: Task = { ...mockTask, id: '2', name: 'Other Task' }

      act(() => {
        result.current.addTask(mockTask)
        result.current.addTask(otherTask)
        result.current.setActiveTask(mockTask.id)
      })

      act(() => {
        result.current.removeTask(otherTask.id)
      })
      expect(result.current.activeTaskId).toBe(mockTask.id)
    })
  })
})

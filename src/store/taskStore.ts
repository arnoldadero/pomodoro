import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TaskState, Task, ValidationResult } from '../types'

export interface TaskActions {
  addTask: (task: Task) => boolean
  updateTask: (task: Task) => void
  removeTask: (id: string) => void
  setActiveTask: (id: string | null) => void
  validateTask: (task: Partial<Task>) => ValidationResult
}

const validateTask = (task: Partial<Task>): ValidationResult => {
  const errors: string[] = []

  if (!task.name || task.name.trim() === '') {
    errors.push('Task name cannot be empty')
  }

  if (!task.estimatedPomos || task.estimatedPomos <= 0) {
    errors.push('Estimated Pomodoros must be a positive number')
  }

  if (!task.priority) {
    errors.push('Priority must be selected')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const useTaskStore = create<TaskState & TaskActions>()(
  persist(
    (set) => ({
      tasks: [],
      activeTaskId: null,
      addTask: (task) => {
        const validation = validateTask(task)
        if (!validation.isValid) {
          return false
        }
        set((state) => ({
          tasks: [...state.tasks, task]
        }))
        return true
      },
      updateTask: (task) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === task.id ? task : t))
        })),
      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          activeTaskId: state.activeTaskId === id ? null : state.activeTaskId
        })),
      setActiveTask: (id) => set({ activeTaskId: id }),
      validateTask
    }),
    {
      name: 'pomodoro-tasks'
    }
  )
)

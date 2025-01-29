import { useEffect, useCallback } from 'react'
import { useTimerStore } from '../store/timerStore'
import { useTaskStore } from '../store/taskStore'
import { Task } from '../types'

const isEditableElement = (element: HTMLElement | null): boolean => {
  if (!element) {
    return false
  }

  // Check for standard form elements
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return true
  }

  // Check for content editable elements
  if (element.isContentEditable) {
    return true
  }

  // Check for role="textbox" and similar ARIA roles
  const role = element.getAttribute('role')
  if (role === 'textbox' || role === 'searchbox' || role === 'combobox') {
    return true
  }

  return false
}

const findNextTask = (tasks: Task[], currentTaskId: string | null): Task | undefined => {
  if (!tasks.length) {
    return undefined
  }

  if (!currentTaskId) {
    // No active task - return first non-completed task or first task
    return tasks.find(t => t.status !== 'completed') || tasks[0]
  }

  const currentIndex = tasks.findIndex(t => t.id === currentTaskId)
  if (currentIndex === -1) {
    return tasks[0]
  }

  // Try to find next non-completed task
  let nextIndex = (currentIndex + 1) % tasks.length
  let attempts = tasks.length

  while (attempts > 0) {
    const task = tasks[nextIndex]
    if (task && task.status !== 'completed') {
      return task
    }
    nextIndex = (nextIndex + 1) % tasks.length
    attempts--
  }

  // If no non-completed tasks found, return next task in sequence
  return tasks[(currentIndex + 1) % tasks.length]
}

export function useKeyboardShortcuts() {
  const { toggleRunning, resetTimer } = useTimerStore()
  const { activeTaskId, tasks, setActiveTask } = useTaskStore()

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if any modifier keys are pressed (except Shift)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      const target = event.target as HTMLElement

      // Ignore shortcuts when typing in editable elements
      if (isEditableElement(target)) {
        return
      }

      // Handle each shortcut
      switch (event.key.toLowerCase()) {
        case ' ':
          // Only handle space if not scrolling
          if (target === document.body || target.contains(document.activeElement)) {
            event.preventDefault()
            toggleRunning()
          }
          break

        case 'escape':
          // Handle escape only if not in a dialog or modal
          if (!document.querySelector('[role="dialog"]:focus-within')) {
            event.preventDefault()
            resetTimer()
          }
          break

        case 'n':
          // Focus the task name input, ensuring it exists first
          const taskInput = document.getElementById('name')
          if (taskInput instanceof HTMLInputElement) {
            event.preventDefault()
            taskInput.focus()
          }
          break

        case 'f':
          // Focus next task with improved error handling
          event.preventDefault()
          if (!tasks?.length) {
            return
          }

          try {
            const availableTasks = [...tasks]
            if (!availableTasks.length) {
              return
            }

            const nextTask = findNextTask(availableTasks, activeTaskId)
            if (nextTask) {
              setActiveTask(nextTask.id)
            }
          } catch (error) {
            console.error('Error navigating tasks:', error)
          }
          break

        default:
          break
      }
    },
    [toggleRunning, resetTimer, activeTaskId, tasks, setActiveTask]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress, { passive: false })
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])
}

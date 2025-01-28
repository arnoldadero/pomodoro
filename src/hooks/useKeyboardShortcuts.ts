import { useEffect, useCallback } from 'react'
import { useTimerStore } from '../store/timerStore'
import { useTaskStore } from '../store/taskStore'

export function useKeyboardShortcuts() {
  const { isRunning, toggleRunning, resetTimer } = useTimerStore()
  const { activeTaskId, tasks, setActiveTask } = useTaskStore()

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      // Ignore shortcuts when typing in input fields
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          // Space - Start/Pause Timer
          event.preventDefault()
          toggleRunning()
          break

        case 'escape':
          // Escape - Reset Timer
          event.preventDefault()
          resetTimer()
          break

        case 'n':
          // N - Focus the task name input
          event.preventDefault()
          document.getElementById('name')?.focus()
          break

        case 'f':
          // F - Focus next task
          event.preventDefault()
          if (!tasks || tasks.length === 0) {
            return
          }

          if (!activeTaskId) {
            // If no task is active, focus the first task
            const firstTask = tasks[0]
            if (firstTask) {
              setActiveTask(firstTask.id)
            }
          } else {
            // Find current task index and focus next task
            const currentIndex = tasks.findIndex(t => t.id === activeTaskId)
            if (currentIndex !== -1) {
              const nextIndex = (currentIndex + 1) % tasks.length
              const nextTask = tasks[nextIndex]
              if (nextTask) {
                setActiveTask(nextTask.id)
              }
            }
          }
          break

        default:
          break
      }
    },
    [isRunning, toggleRunning, resetTimer, activeTaskId, tasks, setActiveTask]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])
}

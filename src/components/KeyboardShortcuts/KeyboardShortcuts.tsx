import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconKeyboard } from '@tabler/icons-react'

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const handleOpen = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    // Restore focus after animation completes
    setTimeout(() => {
      previousFocusRef.current?.focus()
    }, 200)
  }, [])

  // Handle click outside
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, handleClose])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      // Only handle Escape if we're not in an input field
      if (event.key === 'Escape' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  // Trap focus within dialog when open
  useEffect(() => {
    if (!isOpen || !dialogRef.current) {
      return
    }

    const dialog = dialogRef.current
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return
      }

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    dialog.addEventListener('keydown', handleTabKey)
    firstFocusable?.focus()

    return () => dialog.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label={isOpen ? 'Close keyboard shortcuts' : 'Show keyboard shortcuts'}
        aria-expanded={isOpen}
        aria-controls="keyboard-shortcuts-panel"
      >
        <IconKeyboard size={24} aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dialogRef}
            id="keyboard-shortcuts-panel"
            role="dialog"
            aria-label="Keyboard shortcuts"
            aria-modal="true"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <header className="mb-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Keyboard Shortcuts
              </h2>
            </header>

            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex justify-between items-center">
                <span>Start/Pause Timer</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Space</kbd>
              </li>
              <li className="flex justify-between items-center">
                <span>Reset Timer</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Esc</kbd>
              </li>
              <li className="flex justify-between items-center">
                <span>New Task</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">N</kbd>
              </li>
              <li className="flex justify-between items-center">
                <span>Focus Next Task</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">F</kbd>
              </li>
            </ul>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="mt-4 w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close keyboard shortcuts"
            >
              Close
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

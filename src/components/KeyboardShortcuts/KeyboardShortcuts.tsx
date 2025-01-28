import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconKeyboard } from '@tabler/icons-react'

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
        aria-label={isOpen ? 'Close keyboard shortcuts' : 'Show keyboard shortcuts'}
      >
        <IconKeyboard size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl"
          >
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Keyboard Shortcuts
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex justify-between">
                <span>Start/Pause Timer</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Space</kbd>
              </li>
              <li className="flex justify-between">
                <span>Reset Timer</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Esc</kbd>
              </li>
              <li className="flex justify-between">
                <span>New Task</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">N</kbd>
              </li>
              <li className="flex justify-between">
                <span>Focus Next Task</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">F</kbd>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { Toast } from './Toast'
import { useToast } from '../../hooks/useToast'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" data-testid="toast-container">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.2 }}
          >
            <Toast
              id={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={removeToast}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Export both components
export { Toast } from './Toast'

import { motion, AnimatePresence } from 'framer-motion'
import { Toast } from './Toast'
import { useToast } from '../../hooks/useToast'

const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none w-[320px]"
      data-testid="toast-container"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3,
              ease: 'easeOut'
            }}
            className="pointer-events-auto"
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

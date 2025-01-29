import { useEffect } from 'react'
import { Toast as ToastType } from '../../types'

interface ToastProps extends ToastType {
  onClose: (id: number) => void
}

const typeStyles = {
  error: 'bg-red-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-black'
} as const

export function Toast({ id, message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 5000) // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div
      role="alert"
      className={`w-full p-4 rounded-lg shadow-lg ${typeStyles[type]}`}
      aria-live="assertive"
      data-testid={`toast-${id}`}
    >
      <div className="flex items-center">
        <span className="mr-4">{message}</span>
        <button
          onClick={() => onClose(id)}
          className="ml-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded-full p-1 hover:opacity-80"
          aria-label="Close notification"
          type="button"
        >
          <span aria-hidden="true" className="text-lg">✕</span>
        </button>
      </div>
    </div>
  )
}

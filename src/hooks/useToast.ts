import { useState, useCallback, useRef, useEffect } from 'react'
import { Toast, ToastType } from '../types'

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map())

  // Clean up any existing timers when unmounting
  useEffect(() => {
    const currentTimers = timersRef.current
    return () => (
      Array.from(currentTimers.values()).forEach(clearTimeout), currentTimers.clear()
    )
  }, [])

  const removeToast = useCallback((id: number) => {
    // Clear the auto-dismiss timer if it exists
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }

    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType = 'error') => {
    const id = Date.now()
    const newToast: Toast = { id, message, type }

    setToasts(prev => [...prev, newToast])

    // Set up auto-dismiss timer
    const timer = setTimeout(() => {
      removeToast(id)
    }, 5000)

    // Store the timer reference
    timersRef.current.set(id, timer)

    return id
  }, [removeToast])

  const clearToasts = useCallback(() => {
    // Clear all auto-dismiss timers
    Array.from(timersRef.current.values()).forEach(timer => clearTimeout(timer))
    timersRef.current.clear()

    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts
  }
}

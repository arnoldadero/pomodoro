import { render, screen } from '@testing-library/react'
import { ToastContainer } from '../../src/components/Toast/ToastContainer'
import { useToast } from '../../src/hooks/useToast'
import { Toast } from '../../src/types'

// Mock useToast hook
jest.mock('../../src/hooks/useToast')

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}))

const mockToasts: Toast[] = [
  {
    id: 1,
    message: 'Success message',
    type: 'success'
  },
  {
    id: 2,
    message: 'Error message',
    type: 'error'
  }
]

const mockRemoveToast = jest.fn()
const mockAddToast = jest.fn()
const mockClearToasts = jest.fn()

const mockToastHook = {
  toasts: [] as Toast[],
  removeToast: mockRemoveToast,
  addToast: mockAddToast,
  clearToasts: mockClearToasts
}

describe('ToastContainer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({
      ...mockToastHook,
      toasts: []
    })
  })

  it('renders empty container when no toasts', () => {
    render(<ToastContainer />)
    const container = screen.getByTestId('toast-container')
    expect(container).toHaveClass('fixed', 'top-4', 'right-4', 'z-50', 'space-y-2')
  })

  it('renders multiple toasts', () => {
    ;(useToast as jest.Mock).mockReturnValue({
      ...mockToastHook,
      toasts: mockToasts
    })

    render(<ToastContainer />)

    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('applies correct layout spacing', () => {
    ;(useToast as jest.Mock).mockReturnValue({
      ...mockToastHook,
      toasts: mockToasts
    })

    render(<ToastContainer />)
    const container = screen.getByTestId('toast-container')
    expect(container).toHaveClass('space-y-2')
  })

  it('passes correct props to Toast components', () => {
    const singleToast: Toast = {
      id: 1,
      message: 'Success message',
      type: 'success'
    }

    ;(useToast as jest.Mock).mockReturnValue({
      ...mockToastHook,
      toasts: [singleToast]
    })

    render(<ToastContainer />)

    const toast = screen.getByRole('alert')
    expect(toast).toHaveTextContent('Success message')
    expect(toast).toHaveClass('bg-green-500', 'text-white') // Success toast styles
  })

  describe('Animation setup', () => {
    it('has animation props on toast wrapper', () => {
      const singleToast: Toast = {
        id: 1,
        message: 'Test message',
        type: 'success'
      }

      ;(useToast as jest.Mock).mockReturnValue({
        ...mockToastHook,
        toasts: [singleToast]
      })

      render(<ToastContainer />)

      const toastWrapper = screen.getByRole('alert').parentElement
      expect(toastWrapper).toHaveAttribute('key', '1')
    })

    it('uses AnimatePresence for managing animations', () => {
      ;(useToast as jest.Mock).mockReturnValue({
        ...mockToastHook,
        toasts: mockToasts
      })

      const { container } = render(<ToastContainer />)
      const toastWrappers = container.querySelectorAll('[key]')
      expect(toastWrappers).toHaveLength(2)
    })
  })

  describe('Toast positioning', () => {
    it('positions container correctly on screen', () => {
      render(<ToastContainer />)
      const container = screen.getByTestId('toast-container')
      expect(container).toHaveClass('fixed', 'top-4', 'right-4')
    })

    it('sets correct z-index for stacking', () => {
      render(<ToastContainer />)
      const container = screen.getByTestId('toast-container')
      expect(container).toHaveClass('z-50')
    })
  })
})

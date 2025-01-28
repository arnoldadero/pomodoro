import { render, screen, fireEvent, act } from '@testing-library/react'
import { Toast } from '../../src/components/Toast/Toast'

// Mock timer API
jest.useFakeTimers()

describe('Toast Component', () => {
  const defaultProps = {
    id: 1,
    message: 'Test message',
    type: 'error' as const,
    onClose: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders toast with message', () => {
    render(<Toast {...defaultProps} />)
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<Toast {...defaultProps} />)

    const closeButton = screen.getByRole('button', { name: /close notification/i })
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalledWith(defaultProps.id)
  })

  it('auto-dismisses after 5 seconds', () => {
    render(<Toast {...defaultProps} />)

    expect(defaultProps.onClose).not.toHaveBeenCalled()

    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(defaultProps.onClose).toHaveBeenCalledWith(defaultProps.id)
  })

  it('cleans up timer on unmount', () => {
    const { unmount } = render(<Toast {...defaultProps} />)

    unmount()

    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  describe('Toast Types', () => {
    it('applies error styles', () => {
      render(<Toast {...defaultProps} type="error" />)
      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('bg-red-500', 'text-white')
    })

    it('applies success styles', () => {
      render(<Toast {...defaultProps} type="success" />)
      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('bg-green-500', 'text-white')
    })

    it('applies warning styles', () => {
      render(<Toast {...defaultProps} type="warning" />)
      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('bg-yellow-500', 'text-black')
    })

    it('defaults to error type when no type provided', () => {
      // @ts-ignore - Testing without required prop
      render(<Toast {...defaultProps} type={undefined} />)
      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('bg-red-500', 'text-white')
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Toast {...defaultProps} />)

      const toast = screen.getByRole('alert')
      expect(toast).toHaveAttribute('aria-live', 'assertive')

      const closeButton = screen.getByRole('button')
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification')
    })

    it('has proper focus management styles', () => {
      render(<Toast {...defaultProps} />)

      const closeButton = screen.getByRole('button')
      expect(closeButton).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'focus:ring-white'
      )
    })
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ErrorBoundary, withErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'

// Mock window.location.reload
const mockReload = jest.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true
})

// Mock console.error to avoid test noise
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('ErrorBoundary', () => {
  const ProblematicComponent = () => {
    throw new Error('Test error')
    return null
  }

  const SafeComponent = () => <div>Safe content</div>

  beforeEach(() => {
    mockReload.mockClear()
  })

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    const fallback = <div>Custom error message</div>
    render(
      <ErrorBoundary fallback={fallback}>
        <ProblematicComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    // Using type assertion to handle readonly property
    ;(process.env as any).NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Test error/)).toBeInTheDocument()

    // Restore original env
    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    // Using type assertion to handle readonly property
    ;(process.env as any).NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    )

    expect(screen.queryByText(/Test error/)).not.toBeInTheDocument()

    // Restore original env
    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('should trigger page reload when refresh button is clicked', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Refresh Page'))
    expect(mockReload).toHaveBeenCalled()
  })

  it('should log error details to console in componentDidCatch', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    )

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary:',
      expect.any(Error),
      expect.any(Object)
    )
  })
})

describe('withErrorBoundary HOC', () => {
  const TestComponent = () => <div>Test content</div>
  const ErrorComponent = () => {
    throw new Error('Test error')
    return null
  }

  it('should wrap component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(TestComponent)
    render(<WrappedComponent />)

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should catch errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ErrorComponent)
    render(<WrappedComponent />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should use custom fallback when provided', () => {
    const fallback = <div>Custom fallback</div>
    const WrappedComponent = withErrorBoundary(ErrorComponent, fallback)
    render(<WrappedComponent />)

    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
  })

  it('should pass props to wrapped component', () => {
    interface TestProps {
      testId: string
      content: string
    }

    const PropsTestComponent = ({ testId, content }: TestProps) => (
      <div data-testid={testId}>{content}</div>
    )

    const WrappedComponent = withErrorBoundary(PropsTestComponent)
    render(<WrappedComponent testId="test" content="Test content" />)

    const element = screen.getByTestId('test')
    expect(element).toHaveTextContent('Test content')
  })
})

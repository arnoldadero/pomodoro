import { Component, ErrorInfo, ReactNode } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800"
        >
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
            <IconAlertTriangle size={24} aria-hidden="true" />
            <h2 className="text-xl font-bold">Something went wrong</h2>
          </div>

          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              An error occurred in this component. Please try refreshing the page or contact support if
              the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto">
                <pre className="text-sm font-mono">
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

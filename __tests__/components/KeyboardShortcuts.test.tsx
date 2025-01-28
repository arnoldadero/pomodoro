import { render, screen, fireEvent } from '@testing-library/react'
import { KeyboardShortcuts } from '../../src/components/KeyboardShortcuts/KeyboardShortcuts'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}))

describe('KeyboardShortcuts Component', () => {
  it('renders keyboard shortcuts button initially', () => {
    render(<KeyboardShortcuts />)
    const button = screen.getByRole('button', { name: /show keyboard shortcuts/i })
    expect(button).toBeInTheDocument()
  })

  it('toggles shortcuts visibility on button click', () => {
    render(<KeyboardShortcuts />)

    // Initially shortcuts should be hidden
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()

    // Click to show shortcuts
    const button = screen.getByRole('button', { name: /show keyboard shortcuts/i })
    fireEvent.click(button)

    // Shortcuts should be visible
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    expect(button).toHaveAccessibleName('Close keyboard shortcuts')

    // Click to hide shortcuts
    fireEvent.click(button)
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
    expect(button).toHaveAccessibleName('Show keyboard shortcuts')
  })

  it('displays all keyboard shortcuts correctly', () => {
    render(<KeyboardShortcuts />)

    // Show shortcuts
    fireEvent.click(screen.getByRole('button'))

    // Check all shortcuts are displayed
    const shortcuts = [
      { action: 'Start/Pause Timer', key: 'Space' },
      { action: 'Reset Timer', key: 'Esc' },
      { action: 'New Task', key: 'N' },
      { action: 'Focus Next Task', key: 'F' }
    ]

    shortcuts.forEach(({ action, key }) => {
      expect(screen.getByText(action)).toBeInTheDocument()
      expect(screen.getByText(key)).toBeInTheDocument()
    })
  })

  it('has correct styles for keyboard shortcuts', () => {
    render(<KeyboardShortcuts />)
    fireEvent.click(screen.getByRole('button'))

    // Check heading styles
    const heading = screen.getByText('Keyboard Shortcuts')
    expect(heading).toHaveClass('text-lg', 'font-semibold')

    // Check kbd element styles
    const kbdElements = screen.getAllByText(/.+/i).filter(element =>
      element.tagName.toLowerCase() === 'kbd'
    )
    kbdElements.forEach(kbd => {
      expect(kbd).toHaveClass('px-2', 'py-1', 'bg-gray-100', 'dark:bg-gray-700', 'rounded', 'text-sm')
    })

    // Check container styles
    const container = heading.parentElement
    expect(container).toHaveClass(
      'absolute',
      'bottom-16',
      'right-0',
      'w-64',
      'p-4',
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'shadow-xl'
    )
  })

  it('positions the button correctly', () => {
    render(<KeyboardShortcuts />)

    const buttonContainer = screen.getByRole('button').parentElement
    expect(buttonContainer).toHaveClass('fixed', 'bottom-4', 'right-4')
  })

  it('maintains button styles', () => {
    render(<KeyboardShortcuts />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass(
      'p-3',
      'bg-indigo-500',
      'text-white',
      'rounded-full',
      'shadow-lg',
      'hover:bg-indigo-600',
      'transition-colors'
    )
  })
})

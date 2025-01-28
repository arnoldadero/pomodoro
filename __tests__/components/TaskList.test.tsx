import { render, screen, fireEvent } from '@testing-library/react'
import { TaskList } from '../../src/components/Task/TaskList'
import { useTaskStore } from '../../src/store/taskStore'
import { useTimerStore } from '../../src/store/timerStore'
import { useToast } from '../../src/hooks/useToast'
import { Task } from '../../src/types'
import { formatTime, formatDate, createCalendarUrl } from '../../src/utils'
import { TASK_STATUS } from '../../src/constants'

// Mock dependencies
jest.mock('../../src/store/taskStore')
jest.mock('../../src/store/timerStore')
jest.mock('../../src/hooks/useToast')
jest.mock('../../src/utils', () => ({
  formatTime: jest.fn((ms: number) => `${ms}ms`),
  formatDate: jest.fn((date: string) => date),
  createCalendarUrl: jest.fn((task: Task) => `calendar-url-${task.id}`)
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>
  },
  AnimatePresence: ({ children }: any) => children
}))

const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Task 1',
    priority: 'High',
    estimatedPomos: 4,
    actualPomos: 2,
    timeSpent: 3000,
    description: 'Test description',
    deadline: '2024-12-31T23:59',
    labels: [],
    status: 'todo',
    createdAt: '2024-01-01T00:00'
  },
  {
    id: '2',
    name: 'Task 2',
    priority: 'Medium',
    estimatedPomos: 2,
    actualPomos: 1,
    timeSpent: 1500,
    description: 'Another test',
    deadline: '2024-12-30T23:59',
    labels: [],
    status: 'in-progress',
    createdAt: '2024-01-01T00:00'
  },
  {
    id: '3',
    name: 'Task 3',
    priority: 'Low',
    estimatedPomos: 1,
    actualPomos: 0,
    timeSpent: 0,
    description: 'No deadline task',
    deadline: null,
    labels: [],
    status: 'completed',
    createdAt: '2024-01-01T00:00'
  }
]

const mockUseTaskStore = useTaskStore as jest.MockedFunction<typeof useTaskStore>
const mockUseTimerStore = useTimerStore as jest.MockedFunction<typeof useTimerStore>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

const mockRemoveTask = jest.fn()
const mockSetActiveTask = jest.fn()
const mockToggleRunning = jest.fn()
const mockAddToast = jest.fn()

describe('TaskList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTaskStore.mockReturnValue({
      tasks: mockTasks,
      activeTaskId: null,
      removeTask: mockRemoveTask,
      setActiveTask: mockSetActiveTask
    } as any)
    mockUseTimerStore.mockReturnValue({
      isRunning: false,
      toggleRunning: mockToggleRunning
    } as any)
    mockUseToast.mockReturnValue({
      addToast: mockAddToast
    } as any)
  })

  it('renders tasks list with header', () => {
    render(<TaskList />)
    expect(screen.getByText('Task Queue')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
  })

  describe('Task Status and Progress Display', () => {
    it('displays pomodoro progress correctly', () => {
      render(<TaskList />)
      expect(screen.getByText('(2/4 pomos)')).toBeInTheDocument()
      expect(screen.getByText('(1/2 pomos)')).toBeInTheDocument()
      expect(screen.getByText('(0/1 pomos)')).toBeInTheDocument()
    })

    it('formats and displays time spent correctly', () => {
      render(<TaskList />)
      expect(formatTime).toHaveBeenCalledWith(3000)
      expect(formatTime).toHaveBeenCalledWith(1500)
      expect(formatTime).toHaveBeenCalledWith(0)
    })

    it('shows active task with highlighted state', () => {
      mockUseTaskStore.mockReturnValue({
        ...mockUseTaskStore(),
        activeTaskId: '1'
      } as any)

      render(<TaskList />)
      const activeTask = screen.getByText('Task 1').closest('div[class*="bg-indigo-50"]')
      expect(activeTask).toBeInTheDocument()
    })
  })

  describe('Task Filtering', () => {
    it('filters tasks by status', () => {
      render(<TaskList />)
      const filterSelect = screen.getByLabelText('Filter tasks by status')

      // Test each status
      TASK_STATUS.forEach(status => {
        fireEvent.change(filterSelect, { target: { value: status } })
        const visibleTasks = mockTasks.filter(task => task.status === status)
        visibleTasks.forEach(task => {
          expect(screen.getByText(task.name)).toBeInTheDocument()
        })
      })
    })

    it('shows empty state when no tasks match filter', () => {
      mockUseTaskStore.mockReturnValue({
        ...mockUseTaskStore(),
        tasks: []
      } as any)

      render(<TaskList />)
      expect(screen.getByText('No tasks found. Add some tasks to get started!')).toBeInTheDocument()
    })
  })

  describe('Task Sorting', () => {
    it('sorts tasks by deadline handling null values', () => {
      render(<TaskList />)
      const sortButton = screen.getByLabelText('Sort by deadline')

      fireEvent.click(sortButton) // First click - ascending
      expect(formatDate).toHaveBeenCalledWith('2024-12-30T23:59')

      fireEvent.click(sortButton) // Second click - descending
      expect(formatDate).toHaveBeenCalledWith('2024-12-31T23:59')
    })

    it('sorts tasks by priority', () => {
      render(<TaskList />)
      const sortButton = screen.getByLabelText('Sort by priority')

      fireEvent.click(sortButton)
      const taskHeadings = screen.getAllByRole('heading')
      expect(taskHeadings[1]).toHaveTextContent('Task 1') // High priority first
      expect(taskHeadings[2]).toHaveTextContent('Task 2') // Medium priority second
      expect(taskHeadings[3]).toHaveTextContent('Task 3') // Low priority last
    })

    it('sorts tasks by estimated pomodoros', () => {
      render(<TaskList />)
      const sortButton = screen.getByLabelText('Sort by estimated pomodoros')

      fireEvent.click(sortButton)
      const taskHeadings = screen.getAllByRole('heading')
      expect(taskHeadings[1]).toHaveTextContent('Task 3') // 1 pomo
      expect(taskHeadings[2]).toHaveTextContent('Task 2') // 2 pomos
      expect(taskHeadings[3]).toHaveTextContent('Task 1') // 4 pomos
    })
  })

  describe('Task Actions', () => {
    it('handles task deletion with confirmation', () => {
      window.confirm = jest.fn(() => true)
      render(<TaskList />)

      const deleteButtons = screen.getAllByLabelText('Delete task')
      expect(deleteButtons[0]).toBeInTheDocument()
      fireEvent.click(deleteButtons[0]!)

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')
      expect(mockRemoveTask).toHaveBeenCalledWith('1')
      expect(mockAddToast).toHaveBeenCalledWith('Task deleted successfully', 'success')
    })

    it('cancels task deletion when confirmation is declined', () => {
      window.confirm = jest.fn(() => false)
      render(<TaskList />)

      const deleteButtons = screen.getAllByLabelText('Delete task')
      expect(deleteButtons[0]).toBeInTheDocument()
      fireEvent.click(deleteButtons[0]!)

      expect(mockRemoveTask).not.toHaveBeenCalled()
      expect(mockAddToast).not.toHaveBeenCalled()
    })

    it('focuses on a task and starts timer when timer is stopped', () => {
      render(<TaskList />)
      const focusButtons = screen.getAllByLabelText(/Focus/)
      expect(focusButtons[0]).toBeInTheDocument()
      fireEvent.click(focusButtons[0]!)

      expect(mockSetActiveTask).toHaveBeenCalledWith('1')
      expect(mockToggleRunning).toHaveBeenCalled()
    })

    it('focuses on a task without starting timer when timer is running', () => {
      mockUseTimerStore.mockReturnValue({
        isRunning: true,
        toggleRunning: mockToggleRunning
      } as any)

      render(<TaskList />)
      const focusButtons = screen.getAllByLabelText(/Focus/)
      expect(focusButtons[0]).toBeInTheDocument()
      fireEvent.click(focusButtons[0]!)

      expect(mockSetActiveTask).toHaveBeenCalledWith('1')
      expect(mockToggleRunning).not.toHaveBeenCalled()
    })

    it('creates calendar links for tasks with deadlines', () => {
      render(<TaskList />)
      const calendarLinks = screen.getAllByLabelText('Add to calendar')

      expect(calendarLinks).toHaveLength(2) // Only tasks 1 and 2 have deadlines
      expect(calendarLinks[0]).toHaveAttribute('href', 'calendar-url-1')
      expect(calendarLinks[0]).toHaveAttribute('target', '_blank')
      expect(calendarLinks[0]).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Accessibility', () => {
    it('indicates task priority visually and with aria-label', () => {
      render(<TaskList />)
      const priorities = screen.getAllByLabelText(/Priority:/)

      expect(priorities[0]).toHaveAttribute('aria-label', 'Priority: High')
      expect(priorities[1]).toHaveAttribute('aria-label', 'Priority: Medium')
      expect(priorities[2]).toHaveAttribute('aria-label', 'Priority: Low')
    })

    it('provides proper aria-labels for interactive elements', () => {
      render(<TaskList />)

      expect(screen.getByLabelText('Filter tasks by status')).toBeInTheDocument()
      expect(screen.getByLabelText('Sort by deadline')).toBeInTheDocument()
      expect(screen.getByLabelText('Sort by priority')).toBeInTheDocument()
      expect(screen.getAllByLabelText(/Focus/).length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Delete task').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Add to calendar').length).toBe(2)
    })

    it('indicates active task status in focus button label', () => {
      mockUseTaskStore.mockReturnValue({
        ...mockUseTaskStore(),
        activeTaskId: '1'
      } as any)

      render(<TaskList />)
      expect(screen.getByLabelText('Current focus task')).toBeInTheDocument()
      expect(screen.getAllByLabelText('Focus on this task')).toHaveLength(2)
    })
  })
})

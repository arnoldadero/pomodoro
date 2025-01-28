import { render, screen, fireEvent } from '@testing-library/react'
import { TaskForm } from '../../src/components/Task/TaskForm'
import { useTaskStore } from '../../src/store/taskStore'
import { useToast } from '../../src/hooks/useToast'
import { TASK_PRIORITIES } from '../../src/constants'
import type { Task } from '../../src/types'

// Mock dependencies
jest.mock('../../src/store/taskStore')
jest.mock('../../src/hooks/useToast')
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    )
  }
}))

// Mock Date.now and toISOString for consistent testing
const mockDateNow = 12345
const mockISOString = '2024-01-01T00:00:00.000Z'
Date.now = jest.fn(() => mockDateNow)
const mockDate = new Date(mockDateNow)
const originalToISOString = mockDate.toISOString
mockDate.toISOString = jest.fn(() => mockISOString)
global.Date = jest.fn(() => mockDate) as any

const mockUseTaskStore = useTaskStore as jest.MockedFunction<typeof useTaskStore>
const mockAddTask = jest.fn()
const mockAddToast = jest.fn()

describe('TaskForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTaskStore.mockReturnValue({ addTask: mockAddTask } as any)
    ;(useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast })
    mockAddTask.mockReturnValue(true) // Default to successful task addition
  })

  it('renders form with all fields', () => {
    render(<TaskForm />)

    expect(screen.getByLabelText('Task Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
    expect(screen.getByLabelText('Estimated Pomodoros')).toBeInTheDocument()
    expect(screen.getByLabelText('Deadline')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByText('Add Task')).toBeInTheDocument()
  })

  it('renders all priority options', () => {
    render(<TaskForm />)

    const prioritySelect = screen.getByLabelText('Priority')
    TASK_PRIORITIES.forEach(priority => {
      expect(prioritySelect).toContainHTML(priority)
    })
  })

  describe('Form Interactions', () => {
    const fillForm = (overrides: Partial<{
      name: string
      priority: Task['priority']
      estimatedPomos: string
      description: string
      deadline: string
    }> = {}) => {
      fireEvent.change(screen.getByLabelText('Task Name'), {
        target: { name: 'name', value: overrides.name || 'Test Task' }
      })
      fireEvent.change(screen.getByLabelText('Priority'), {
        target: { name: 'priority', value: overrides.priority || 'High' }
      })
      fireEvent.change(screen.getByLabelText('Estimated Pomodoros'), {
        target: { name: 'estimatedPomos', value: overrides.estimatedPomos || '3' }
      })
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { name: 'description', value: overrides.description || 'Test Description' }
      })
      fireEvent.change(screen.getByLabelText('Deadline'), {
        target: { name: 'deadline', value: overrides.deadline || '2024-12-31T23:59' }
      })
    }

    it('handles input changes correctly', () => {
      render(<TaskForm />)
      fillForm()

      expect(screen.getByLabelText('Task Name')).toHaveValue('Test Task')
      expect(screen.getByLabelText('Priority')).toHaveValue('High')
      expect(screen.getByLabelText('Estimated Pomodoros')).toHaveValue(3)
      expect(screen.getByLabelText('Description')).toHaveValue('Test Description')
      expect(screen.getByLabelText('Deadline')).toHaveValue('2024-12-31T23:59')
    })

    it('handles empty deadline correctly', () => {
      render(<TaskForm />)
      fillForm({ deadline: '' })

      expect(screen.getByLabelText('Deadline')).toHaveValue('')
    })

    it('handles invalid estimated pomodoros', () => {
      render(<TaskForm />)
      fillForm({ estimatedPomos: 'invalid' })

      expect(screen.getByLabelText('Estimated Pomodoros')).toHaveValue(1)
    })

    it('submits form with correct data', () => {
      render(<TaskForm />)
      fillForm()

      fireEvent.submit(screen.getByRole('form'))

      expect(mockAddTask).toHaveBeenCalledWith(expect.objectContaining({
        id: mockDateNow.toString(),
        name: 'Test Task',
        priority: 'High',
        estimatedPomos: 3,
        description: 'Test Description',
        deadline: '2024-12-31T23:59',
        status: 'todo',
        actualPomos: 0,
        timeSpent: 0,
        labels: [],
        createdAt: mockISOString
      }))
    })

    it('shows success toast and resets form on successful submission', () => {
      render(<TaskForm />)
      fillForm()
      fireEvent.submit(screen.getByRole('form'))

      expect(mockAddToast).toHaveBeenCalledWith('Task added successfully', 'success')
      expect(screen.getByLabelText('Task Name')).toHaveValue('')
      expect(screen.getByLabelText('Priority')).toHaveValue('Medium')
      expect(screen.getByLabelText('Estimated Pomodoros')).toHaveValue(1)
      expect(screen.getByLabelText('Description')).toHaveValue('')
      expect(screen.getByLabelText('Deadline')).toHaveValue('')
    })

    it('handles failed task addition', () => {
      mockAddTask.mockReturnValue(false)
      render(<TaskForm />)
      fillForm()
      fireEvent.submit(screen.getByRole('form'))

      // Form should not be reset
      expect(screen.getByLabelText('Task Name')).toHaveValue('Test Task')
      expect(screen.getByLabelText('Priority')).toHaveValue('High')
      expect(screen.getByLabelText('Estimated Pomodoros')).toHaveValue(3)
      expect(screen.getByLabelText('Description')).toHaveValue('Test Description')
      expect(screen.getByLabelText('Deadline')).toHaveValue('2024-12-31T23:59')

      // Success toast should not be shown
      expect(mockAddToast).not.toHaveBeenCalled()
    })

    describe('Form Validation', () => {
      it('requires task name', () => {
        render(<TaskForm />)
        fillForm({ name: '' })
        fireEvent.submit(screen.getByRole('form'))
        expect(mockAddTask).not.toHaveBeenCalled()
      })

      it('requires priority', () => {
        render(<TaskForm />)
        fillForm()
        const prioritySelect = screen.getByLabelText('Priority')
        fireEvent.change(prioritySelect, { target: { name: 'priority', value: '' } })
        fireEvent.submit(screen.getByRole('form'))
        expect(mockAddTask).not.toHaveBeenCalled()
      })

      it('requires estimated pomodoros', () => {
        render(<TaskForm />)
        fillForm()
        const estimatedPomosInput = screen.getByLabelText('Estimated Pomodoros')
        fireEvent.change(estimatedPomosInput, { target: { name: 'estimatedPomos', value: '' } })
        fireEvent.submit(screen.getByRole('form'))
        expect(mockAddTask).not.toHaveBeenCalled()
      })

      it('prevents negative estimated pomodoros', () => {
        render(<TaskForm />)
        fillForm({ estimatedPomos: '-1' })
        fireEvent.submit(screen.getByRole('form'))
        expect(mockAddTask).not.toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper form labeling', () => {
      render(<TaskForm />)
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Add New Task' })).toBeInTheDocument()
    })

    it('marks required fields appropriately', () => {
      render(<TaskForm />)
      const requiredFields = [
        screen.getByLabelText('Task Name'),
        screen.getByLabelText('Priority'),
        screen.getByLabelText('Estimated Pomodoros')
      ]

      requiredFields.forEach(field => {
        expect(field).toHaveAttribute('required')
        expect(field).toHaveAttribute('aria-required', 'true')
      })
    })

    it('uses semantic form structure', () => {
      const { container } = render(<TaskForm />)
      expect(container.querySelector('form')).toHaveClass('space-y-4')
      expect(container.querySelectorAll('label')).toHaveLength(5)
    })
  })
})

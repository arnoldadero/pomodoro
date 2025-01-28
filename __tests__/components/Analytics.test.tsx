import { render, screen } from '@testing-library/react'
import { Analytics } from '../../src/components/Analytics/Analytics'
import { useTaskStore } from '../../src/store/taskStore'
import { formatTime } from '../../src/utils'
import { Task } from '../../src/types'

// Mock dependencies
jest.mock('../../src/store/taskStore')
jest.mock('../../src/utils', () => ({
  formatTime: jest.fn((ms: number) => `${ms}ms`)
}))

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: ({ name, stroke }: any) => (
    <div data-testid="chart-line" data-name={name} style={{ color: stroke }} />
  ),
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, label }: any) => (
    <div data-testid="pie" data-label={typeof label === 'function' ? 'function' : label}>
      {children}
    </div>
  ),
  Cell: ({ fill }: any) => <div data-testid="pie-cell" style={{ backgroundColor: fill }} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Task 1',
    priority: 'High',
    estimatedPomos: 4,
    actualPomos: 2,
    timeSpent: 3000,
    description: 'Test task',
    deadline: '2024-12-31T23:59',
    labels: [],
    status: 'completed',
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
    status: 'todo',
    createdAt: '2024-01-01T00:00'
  }
]

const mockUseTaskStore = useTaskStore as jest.MockedFunction<typeof useTaskStore>

describe('Analytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockStore = { tasks: [] }
    mockUseTaskStore.mockReturnValue(mockStore as ReturnType<typeof useTaskStore>)
  })

  it('shows empty state when no tasks exist', () => {
    render(<Analytics />)
    expect(screen.getByText(/No data available/)).toBeInTheDocument()
  })

  describe('With Tasks Data', () => {
    beforeEach(() => {
      const mockStore = { tasks: mockTasks }
      mockUseTaskStore.mockReturnValue(mockStore as ReturnType<typeof useTaskStore>)
    })

    it('renders analytics header and sections', () => {
      render(<Analytics />)
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Task Completion Trend')).toBeInTheDocument()
      expect(screen.getByText('Task Distribution')).toBeInTheDocument()
    })

    it('displays correct statistics', () => {
      render(<Analytics />)

      // Check productivity metrics
      expect(screen.getByText(/Productivity Score/)).toBeInTheDocument()
      expect(screen.getByText(/Completion Rate/)).toBeInTheDocument()
      expect(screen.getByText(/50%/)).toBeInTheDocument() // 1 out of 2 tasks completed

      // Check time spent
      expect(screen.getByText('Total Time Spent')).toBeInTheDocument()
      expect(formatTime).toHaveBeenCalledWith(4500) // Sum of timeSpent from mockTasks
    })

    it('renders charts with correct data', () => {
      render(<Analytics />)

      // Line Chart
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      const lines = screen.getAllByTestId('chart-line')
      expect(lines[0]).toHaveAttribute('data-name', 'Completed Tasks')
      expect(lines[1]).toHaveAttribute('data-name', 'Estimated Tasks')

      // Pie Chart
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      const pie = screen.getByTestId('pie')
      expect(pie).toBeInTheDocument()
      const cells = screen.getAllByTestId('pie-cell')
      expect(cells).toHaveLength(2) // Completed and Remaining segments
    })

    it('includes chart accessories', () => {
      render(<Analytics />)

      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  describe('Helper Functions', () => {
    it('correctly formats ISO dates', () => {
      const date = new Date('2024-01-01')
      const result = date.toISOString().split('T')[0]
      expect(result).toBe('2024-01-01')
    })

    it('filters tasks by date', () => {
      const targetDate = '2024-12-31'
      const filteredTasks = mockTasks.filter(
        task => task.deadline && new Date(task.deadline).toISOString().split('T')[0] === targetDate
      )
      expect(filteredTasks.length).toBe(1)
      expect(filteredTasks[0]?.id).toBe('1')

      // Additional check to make TypeScript happy
      const matchedTask = filteredTasks.find(task => task.id === '1')
      expect(matchedTask).toBeDefined()
      if (matchedTask) {
        expect(matchedTask.deadline).toBe('2024-12-31T23:59')
      }
    })
  })

  describe('Accessibility', () => {
    it('uses semantic heading structure', () => {
      render(<Analytics />)

      const mainHeading = screen.getByRole('heading', { level: 2, name: 'Analytics' })
      expect(mainHeading).toBeInTheDocument()

      const subHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(subHeadings).toHaveLength(2)
      expect(subHeadings[0]).toHaveTextContent('Task Completion Trend')
      expect(subHeadings[1]).toHaveTextContent('Task Distribution')
    })

    it('hides decorative icons from screen readers', () => {
      render(<Analytics />)
      const icon = screen.getByTestId('chart-line')
      expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true')
    })
  })
})

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '../../src/components/Task/TaskForm'
import { renderWithProviders } from '../utils/test-utils'
import { useTaskStore } from '../../src/store/taskStore'

jest.mock('../../src/store/taskStore', () => ({
  useTaskStore: jest.fn()
}))

const mockedUseTaskStore = useTaskStore as jest.MockedFunction<typeof useTaskStore>

describe('TaskForm', () => {
  const mockDate = new Date('2025-01-01T12:00:00Z')
  const mockTime = mockDate.getTime()

  const mockTaskStore = {
    tasks: [],
    addTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    currentTask: null,
    setCurrentTask: jest.fn()
  }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
    mockedUseTaskStore.mockImplementation(() => mockTaskStore)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    renderWithProviders(<TaskForm />)
    expect(screen.getByRole('form')).toBeInTheDocument()
  })

  it('submits a new task', async () => {
    renderWithProviders(<TaskForm />)

    const titleInput = screen.getByLabelText(/task title/i)
    const submitButton = screen.getByRole('button', { name: /add task/i })

    await userEvent.type(titleInput, 'Test Task')
    await userEvent.click(submitButton)

    expect(mockTaskStore.addTask).toHaveBeenCalledWith({
      id: expect.any(String),
      title: 'Test Task',
      completed: false,
      createdAt: mockTime,
      updatedAt: mockTime
    })
  })

  it('validates required fields', async () => {
    renderWithProviders(<TaskForm />)

    const submitButton = screen.getByRole('button', { name: /add task/i })
    await userEvent.click(submitButton)

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument()
    expect(mockTaskStore.addTask).not.toHaveBeenCalled()
  })

  it('clears form after submission', async () => {
    renderWithProviders(<TaskForm />)

    const titleInput = screen.getByLabelText(/task title/i)
    const submitButton = screen.getByRole('button', { name: /add task/i })

    await userEvent.type(titleInput, 'Test Task')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(titleInput).toHaveValue('')
    })
  })

  it('updates existing task', async () => {
    const existingTask = {
      id: '123',
      title: 'Existing Task',
      completed: false,
      createdAt: mockTime - 1000,
      updatedAt: mockTime - 1000
    }

    mockedUseTaskStore.mockImplementation(() => ({
      ...mockTaskStore,
      currentTask: existingTask
    }))

    renderWithProviders(<TaskForm />)

    const titleInput = screen.getByLabelText(/task title/i)
    const submitButton = screen.getByRole('button', { name: /update task/i })

    expect(titleInput).toHaveValue('Existing Task')

    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Updated Task')
    await userEvent.click(submitButton)

    expect(mockTaskStore.updateTask).toHaveBeenCalledWith({
      ...existingTask,
      title: 'Updated Task',
      updatedAt: mockTime
    })
  })

  it('handles form reset', async () => {
    renderWithProviders(<TaskForm />)

    const titleInput = screen.getByLabelText(/task title/i)
    const resetButton = screen.getByRole('button', { name: /reset/i })

    await userEvent.type(titleInput, 'Test Task')
    await userEvent.click(resetButton)

    expect(titleInput).toHaveValue('')
  })

  it('provides proper accessibility attributes', () => {
    renderWithProviders(<TaskForm />)

    expect(screen.getByRole('form')).toHaveAttribute('aria-label')
    expect(screen.getByLabelText(/task title/i)).toHaveAttribute('aria-required', 'true')
  })
})

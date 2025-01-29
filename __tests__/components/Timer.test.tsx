import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timer } from '../../src/components/Timer/Timer'
import { renderWithProviders, checkA11y } from '../utils/test-utils'
import { useTimerStore, TimerActions } from '../../src/store/timerStore'
import { TimerState } from '../../src/types'

// Cast the mock to preserve both the Jest mock functionality and the store types
const mockedUseTimerStore = useTimerStore as unknown as jest.MockedFunction<typeof useTimerStore>

jest.mock('../../src/store/timerStore', () => ({
  useTimerStore: jest.fn()
}))

describe('Timer', () => {
  const mockTimerStore: TimerState & TimerActions = {
    isRunning: false,
    mode: 'work',
    timeLeft: 1500,
    toggleRunning: jest.fn(),
    resetTimer: jest.fn(),
    setTimeLeft: jest.fn(),
    setMode: jest.fn(),
    incrementWorkCount: jest.fn(),
    workCount: 0
  }

  beforeEach(() => {
    mockedUseTimerStore.mockImplementation(() => mockTimerStore)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    renderWithProviders(<Timer />)
    expect(screen.getByRole('timer')).toBeInTheDocument()
  })

  it('displays correct time format', () => {
    renderWithProviders(<Timer />)
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('hides decorative elements from screen readers', () => {
    renderWithProviders(<Timer />)
    const decorativeElements = screen.getAllByRole('presentation')
    decorativeElements.forEach(element => {
      expect(element).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('has proper ARIA labels for interactive elements', () => {
    renderWithProviders(<Timer />)
    expect(screen.getByRole('button', { name: /start/i })).toHaveAttribute('aria-label')
  })

  it('handles animation properties correctly', async () => {
    renderWithProviders(<Timer />)
    const timerElement = screen.getByRole('timer')
    expect(timerElement).toHaveAttribute('data-state', 'idle')

    // Toggle timer
    await userEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(mockTimerStore.toggleRunning).toHaveBeenCalled()
  })

  it('meets accessibility standards', async () => {
    await checkA11y(<Timer />)
  })

  it('responds to keyboard interactions', async () => {
    renderWithProviders(<Timer />)
    const startButton = screen.getByRole('button', { name: /start/i })

    await userEvent.tab()
    expect(startButton).toHaveFocus()

    await userEvent.keyboard('{enter}')
    expect(mockTimerStore.toggleRunning).toHaveBeenCalled()
  })

  it('updates UI based on timer mode', () => {
    const breakModeStore = {
      ...mockTimerStore,
      mode: 'shortBreak' as const
    }
    mockedUseTimerStore.mockImplementation(() => breakModeStore)

    renderWithProviders(<Timer />)
    expect(screen.getByRole('timer')).toHaveAttribute('data-mode', 'shortBreak')
  })

  it('announces time changes to screen readers', () => {
    renderWithProviders(<Timer />)
    const timerElement = screen.getByRole('timer')
    expect(timerElement).toHaveAttribute('aria-live', 'polite')
    expect(timerElement).toHaveAttribute('aria-atomic', 'true')
    expect(timerElement).toHaveAttribute('aria-label', expect.stringContaining('remaining in'))
  })
})

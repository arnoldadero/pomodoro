import { render, screen, fireEvent, act } from '@testing-library/react'
import { Timer } from '../../src/components/Timer/Timer'
import { useTimerStore } from '../../src/store/timerStore'
import { useTaskStore } from '../../src/store/taskStore'
import { useAudio } from '../../src/hooks/useAudio'
import { formatTime } from '../../src/utils'
import { Task } from '../../src/types'

// Mock dependencies
jest.mock('../../src/store/timerStore')
jest.mock('../../src/store/taskStore')
jest.mock('../../src/hooks/useAudio')
jest.mock('../../src/utils', () => ({
  formatTime: jest.fn(ms => `${Math.floor(ms / 60)}:${String(ms % 60).padStart(2, '0')}`)
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    )
  }
}))

// Mock Audio constants
jest.mock('../../src/constants', () => ({
  AUDIO_PATHS: {
    tick: '/tick.mp3',
    notification: '/notification.mp3'
  },
  TIMER_DURATIONS: {
    work: 1500,
    shortBreak: 300,
    longBreak: 900
  },
  POMOS_BEFORE_LONG_BREAK: 4
}))

const mockTask: Task = {
  id: '1',
  name: 'Test Task',
  priority: 'High',
  estimatedPomos: 4,
  actualPomos: 2,
  timeSpent: 3000,
  description: 'Test description',
  deadline: '2024-12-31T23:59',
  labels: [],
  status: 'in-progress',
  createdAt: '2024-01-01T00:00'
}

// Mock audio functions
const mockPlay = jest.fn()
const mockPause = jest.fn()
const mockStop = jest.fn()

const mockUseTimerStore = useTimerStore as jest.MockedFunction<typeof useTimerStore>
const mockUseTaskStore = useTaskStore as jest.MockedFunction<typeof useTaskStore>
const mockUseAudio = useAudio as jest.MockedFunction<typeof useAudio>

describe('Timer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Setup audio mocks
    mockUseAudio.mockReturnValue({
      play: mockPlay,
      pause: mockPause,
      stop: mockStop
    })

    // Setup initial timer state
    mockUseTimerStore.mockReturnValue({
      timeLeft: 1500,
      isRunning: false,
      mode: 'work',
      workCount: 0,
      setTimeLeft: jest.fn(),
      toggleRunning: jest.fn(),
      setMode: jest.fn(),
      incrementWorkCount: jest.fn(),
      resetTimer: jest.fn()
    } as any)

    // Setup initial task state
    mockUseTaskStore.mockReturnValue({
      tasks: [mockTask],
      activeTaskId: '1',
      updateTask: jest.fn()
    } as any)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders timer with initial state', () => {
    render(<Timer />)

    expect(screen.getByText('Focus Timer')).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByText('work')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start timer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset timer' })).toBeInTheDocument()
  })

  it('updates timer display and controls when running', () => {
    const mockToggleRunning = jest.fn()
    mockUseTimerStore.mockReturnValue({
      ...mockUseTimerStore(),
      isRunning: true,
      toggleRunning: mockToggleRunning
    } as any)

    render(<Timer />)

    expect(screen.getByRole('button', { name: 'Pause timer' })).toBeInTheDocument()
    expect(mockPlay).toHaveBeenCalled() // Tick sound should play
  })

  it('handles timer completion and mode transitions', () => {
    const mockSetMode = jest.fn()
    const mockIncrementWorkCount = jest.fn()
    const mockUpdateTask = jest.fn()

    mockUseTimerStore.mockReturnValue({
      ...mockUseTimerStore(),
      timeLeft: 1,
      isRunning: true,
      mode: 'work',
      workCount: 0,
      setMode: mockSetMode,
      incrementWorkCount: mockIncrementWorkCount
    } as any)

    mockUseTaskStore.mockReturnValue({
      ...mockUseTaskStore(),
      updateTask: mockUpdateTask
    } as any)

    render(<Timer />)

    // Advance timer by 1 second to trigger completion
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockIncrementWorkCount).toHaveBeenCalled()
    expect(mockSetMode).toHaveBeenCalledWith('shortBreak')
    expect(mockStop).toHaveBeenCalled() // Tick sound should stop
    expect(mockPlay).toHaveBeenCalled() // Completion sound should play
  })

  it('updates active task progress during work sessions', () => {
    const mockUpdateTask = jest.fn()
    mockUseTaskStore.mockReturnValue({
      ...mockUseTaskStore(),
      updateTask: mockUpdateTask
    } as any)

    mockUseTimerStore.mockReturnValue({
      ...mockUseTimerStore(),
      isRunning: true,
      mode: 'work'
    } as any)

    render(<Timer />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockUpdateTask).toHaveBeenCalledWith({
      ...mockTask,
      timeSpent: mockTask.timeSpent + 1
    })
  })

  describe('Long Break Transition', () => {
    it('transitions to long break after specified pomodoros', () => {
      const mockSetMode = jest.fn()
      mockUseTimerStore.mockReturnValue({
        ...mockUseTimerStore(),
        timeLeft: 1,
        isRunning: true,
        mode: 'work',
        workCount: 3, // One before long break
        setMode: mockSetMode
      } as any)

      render(<Timer />)

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(mockSetMode).toHaveBeenCalledWith('longBreak')
    })
  })

  describe('Timer Controls', () => {
    it('handles reset action', () => {
      const mockResetTimer = jest.fn()
      mockUseTimerStore.mockReturnValue({
        ...mockUseTimerStore(),
        resetTimer: mockResetTimer
      } as any)

      render(<Timer />)
      const resetButton = screen.getByRole('button', { name: 'Reset timer' })
      fireEvent.click(resetButton)

      expect(mockResetTimer).toHaveBeenCalled()
    })

    it('toggles timer state', () => {
      const mockToggleRunning = jest.fn()
      mockUseTimerStore.mockReturnValue({
        ...mockUseTimerStore(),
        toggleRunning: mockToggleRunning
      } as any)

      render(<Timer />)
      const startButton = screen.getByRole('button', { name: 'Start timer' })
      fireEvent.click(startButton)

      expect(mockToggleRunning).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('provides appropriate ARIA labels', () => {
      render(<Timer />)

      const timer = screen.getByRole('timer')
      expect(timer).toHaveAttribute('aria-label', expect.stringContaining('remaining in work mode'))

      expect(screen.getByRole('button', { name: 'Start timer' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reset timer' })).toBeInTheDocument()
    })

    it('hides decorative elements from screen readers', () => {
      render(<Timer />)
      const decorativeIcon = screen.getByRole('img', { hidden: true })
      expect(decorativeIcon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})

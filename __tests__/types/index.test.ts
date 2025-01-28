import type {
  TimerMode,
  Task,
  ToastType,
  Toast,
  TimerState,
  TaskState,
  SettingsState,
  ValidationResult,
  DateRange
} from '../../src/types'

describe('types/index', () => {
  describe('TimerMode', () => {
    it('should allow valid timer modes', () => {
      const modes: TimerMode[] = ['work', 'shortBreak', 'longBreak']
      expect(modes).toBeDefined()
    })
  })

  describe('Task', () => {
    it('should validate task interface', () => {
      const task: Task = {
        id: '1',
        name: 'Test Task',
        priority: 'High',
        estimatedPomos: 2,
        actualPomos: 1,
        timeSpent: 1500,
        description: 'Test description',
        deadline: null,
        labels: ['test'],
        status: 'todo',
        createdAt: new Date().toISOString()
      }
      expect(task).toHaveProperty('id')
      expect(task).toHaveProperty('name')
      expect(task).toHaveProperty('priority')
      expect(task).toHaveProperty('estimatedPomos')
      expect(task).toHaveProperty('actualPomos')
      expect(task).toHaveProperty('timeSpent')
      expect(task).toHaveProperty('description')
      expect(task).toHaveProperty('deadline')
      expect(task).toHaveProperty('labels')
      expect(task).toHaveProperty('status')
      expect(task).toHaveProperty('createdAt')
    })
  })

  describe('ToastType', () => {
    it('should allow valid toast types', () => {
      const types: ToastType[] = ['error', 'success', 'warning']
      expect(types).toBeDefined()
    })
  })

  describe('Toast', () => {
    it('should validate toast interface', () => {
      const toast: Toast = {
        id: 1,
        message: 'Test message',
        type: 'success'
      }
      expect(toast).toHaveProperty('id')
      expect(toast).toHaveProperty('message')
      expect(toast).toHaveProperty('type')
    })
  })

  describe('TimerState', () => {
    it('should validate timer state interface', () => {
      const timerState: TimerState = {
        timeLeft: 1500,
        isRunning: false,
        mode: 'work',
        workCount: 0
      }
      expect(timerState).toHaveProperty('timeLeft')
      expect(timerState).toHaveProperty('isRunning')
      expect(timerState).toHaveProperty('mode')
      expect(timerState).toHaveProperty('workCount')
    })
  })

  describe('TaskState', () => {
    it('should validate task state interface', () => {
      const taskState: TaskState = {
        tasks: [],
        activeTaskId: null
      }
      expect(taskState).toHaveProperty('tasks')
      expect(taskState).toHaveProperty('activeTaskId')
    })
  })

  describe('SettingsState', () => {
    it('should validate settings state interface', () => {
      const settingsState: SettingsState = {
        darkMode: false,
        spotifyTrack: '',
        volume: 0.5
      }
      expect(settingsState).toHaveProperty('darkMode')
      expect(settingsState).toHaveProperty('spotifyTrack')
      expect(settingsState).toHaveProperty('volume')
    })
  })

  describe('ValidationResult', () => {
    it('should validate validation result interface', () => {
      const validationResult: ValidationResult = {
        isValid: true,
        errors: []
      }
      expect(validationResult).toHaveProperty('isValid')
      expect(validationResult).toHaveProperty('errors')
    })
  })

  describe('DateRange', () => {
    it('should validate date range interface', () => {
      const dateRange: DateRange = {
        start: new Date().toISOString(),
        end: new Date().toISOString()
      }
      expect(dateRange).toHaveProperty('start')
      expect(dateRange).toHaveProperty('end')
    })
  })
})

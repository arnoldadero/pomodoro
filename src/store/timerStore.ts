import { create } from 'zustand'
import { TimerState, TimerMode } from '../types'

export interface TimerActions {
  setTimeLeft: (time: number) => void
  toggleRunning: () => void
  setMode: (mode: TimerMode) => void
  incrementWorkCount: () => void
  resetTimer: () => void
}

const getInitialTime = (mode: TimerMode) => {
  switch (mode) {
    case 'work':
      return 25 * 60
    case 'shortBreak':
      return 5 * 60
    case 'longBreak':
      return 15 * 60
  }
}

export const useTimerStore = create<TimerState & TimerActions>((set) => ({
  timeLeft: getInitialTime('work'),
  isRunning: false,
  mode: 'work',
  workCount: 0,
  setTimeLeft: (time: number) => set({ timeLeft: time }),
  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),
  setMode: (mode: TimerMode) => set({ mode, timeLeft: getInitialTime(mode) }),
  incrementWorkCount: () => set((state) => ({ workCount: state.workCount + 1 })),
  resetTimer: () => set((state) => ({ timeLeft: getInitialTime(state.mode), isRunning: false }))
}))

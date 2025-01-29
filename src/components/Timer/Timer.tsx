'use client'

import React, { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTimerStore } from '@/store/timerStore'
import { TimerMode } from '@/types'
import { useTaskStore } from '@/store/taskStore'

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getInitialDuration(mode: TimerMode): number {
  switch (mode) {
    case 'work':
      return 25 * 60 // 25 minutes
    case 'shortBreak':
      return 5 * 60  // 5 minutes
    case 'longBreak':
      return 15 * 60 // 15 minutes
    default:
      return 25 * 60 // default to work duration
  }
}

const Timer = () => {
  const { isRunning, mode, timeLeft, setTimeLeft, toggleRunning: toggleTimer, resetTimer } = useTimerStore()
  const { activeTaskId, tasks, updateTask } = useTaskStore()

  const activeTask = tasks.find(task => task.id === activeTaskId)

  const tick = useCallback(() => {
    if (timeLeft > 0) {
      setTimeLeft(timeLeft - 1)
      // Update time spent every second for the active task
      if (isRunning && activeTask && mode === 'work') {
        const updatedTask = {
          ...activeTask,
          timeSpent: activeTask.timeSpent + 1
        }
        updateTask(updatedTask)
      }
    } else {
      toggleTimer()
      // When a work session completes, update the pomodoro count
      if (mode === 'work' && activeTask) {
        const updatedTask = {
          ...activeTask,
          actualPomos: activeTask.actualPomos + 1
        }
        updateTask(updatedTask)
      }
    }
  }, [timeLeft, setTimeLeft, toggleTimer, mode, activeTask, updateTask, isRunning])

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(tick, 1000) // Update every second
    }
    return () => clearInterval(intervalId)
  }, [isRunning, timeLeft, tick])

  const containerVariants = {
    idle: { scale: 1 },
    running: { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 2 } }
  }

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }

  const progressPercentage = (timeLeft / getInitialDuration(mode)) * 100

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      role="region"
      aria-label={`${mode} timer${activeTask ? ` for ${activeTask.name}` : ''}`}
    >
      {activeTask && (
        <div className="text-lg font-medium text-gray-700">
          {activeTask.name} ({activeTask.actualPomos}/{activeTask.estimatedPomos} Pomos)
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-6">
        <motion.div
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${formatTime(timeLeft)} remaining in ${mode} mode`}
          data-state={isRunning ? 'running' : 'idle'}
          data-mode={mode}
          variants={containerVariants}
          animate={isRunning ? 'running' : 'idle'}
          className="relative flex items-center justify-center w-64 h-64"
        >
          {/* Decorative circle */}
          <div
            role="presentation"
            aria-hidden="true"
            className="absolute inset-0 border-4 border-gray-200 rounded-full"
          />
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {/* Progress circle */}
            <div
              role="presentation"
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: `conic-gradient(#4CAF50 ${progressPercentage}%, transparent 0)`
              }}
            />
          </div>

          <span className="relative text-4xl font-bold z-10" aria-hidden="true">
            {formatTime(timeLeft)}
          </span>
        </motion.div>

        <div className="flex gap-4">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={toggleTimer}
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            className="px-6 py-2 text-lg font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {isRunning ? 'Pause' : 'Start'}
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={resetTimer}
            aria-label="Reset timer"
            className="px-6 py-2 text-lg font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Timer

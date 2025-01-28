import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { IconClock } from '@tabler/icons-react'
import { useTimerStore } from '../../store/timerStore'
import { useTaskStore } from '../../store/taskStore'
import { useAudio } from '../../hooks/useAudio'
import { AUDIO_PATHS, TIMER_DURATIONS, POMOS_BEFORE_LONG_BREAK } from '../../constants'
import { formatTime } from '../../utils'

export function Timer() {
  const {
    timeLeft,
    isRunning,
    mode,
    workCount,
    setTimeLeft,
    toggleRunning,
    setMode,
    incrementWorkCount,
    resetTimer
  } = useTimerStore()

  const { tasks, activeTaskId, updateTask } = useTaskStore()

  const tickSound = useAudio({ src: AUDIO_PATHS.tick, loop: true })
  const completionSound = useAudio({ src: AUDIO_PATHS.notification })

  // Memoize the timer progress calculation
  const progress = useMemo(() => {
    const totalDuration = TIMER_DURATIONS[mode]
    return (timeLeft / totalDuration) * 283 // SVG circle circumference
  }, [timeLeft, mode])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      tickSound.play()
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)

        // Update active task time if in work mode
        if (activeTaskId && mode === 'work') {
          const activeTask = tasks.find(task => task.id === activeTaskId)
          if (activeTask) {
            updateTask({
              ...activeTask,
              timeSpent: activeTask.timeSpent + 1
            })
          }
        }

        // Handle timer completion
        if (timeLeft <= 1) {
          tickSound.stop()
          completionSound.play()

          if (mode === 'work') {
            incrementWorkCount()
            const shouldTakeLongBreak = workCount >= POMOS_BEFORE_LONG_BREAK - 1

            // Update active task if exists
            if (activeTaskId) {
              const activeTask = tasks.find(task => task.id === activeTaskId)
              if (activeTask) {
                updateTask({
                  ...activeTask,
                  actualPomos: activeTask.actualPomos + 1,
                  status: activeTask.actualPomos + 1 >= activeTask.estimatedPomos
                    ? 'completed'
                    : 'in-progress'
                })
              }
            }

            setMode(shouldTakeLongBreak ? 'longBreak' : 'shortBreak')
          } else {
            setMode('work')
          }
        }
      }, 1000)
    } else {
      tickSound.pause()
    }

    return () => {
      clearInterval(interval)
      tickSound.pause()
    }
  }, [
    isRunning,
    timeLeft,
    mode,
    workCount,
    activeTaskId,
    tasks,
    setTimeLeft,
    setMode,
    incrementWorkCount,
    updateTask,
    tickSound,
    completionSound
  ])

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <IconClock size={24} aria-hidden="true" />
          <h1 className="text-2xl font-bold">Focus Timer</h1>
        </div>

        <div className="relative w-64 h-64" role="timer" aria-label={`${formatTime(timeLeft)} remaining in ${mode} mode`}>
          <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
            />
            <circle
              className="text-indigo-500 dark:text-indigo-400 transition-all duration-200"
              strokeWidth="8"
              strokeDasharray={`${progress} 283`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-200">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {mode.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRunning}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? 'Pause' : 'Start'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-colors"
            aria-label="Reset timer"
          >
            Reset
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

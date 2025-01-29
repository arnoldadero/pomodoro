'use client'

import { useMemo, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconListCheck,
  IconCalendarEvent,
  IconTrash,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconClock
} from '@tabler/icons-react'
import { useTaskStore } from '../../store/taskStore'
import { useTimerStore } from '../../store/timerStore'
import { useToast } from '../../hooks/useToast'
import { formatTime, formatDate, createCalendarUrl } from '../../utils'
import { TASK_STATUS } from '../../constants'
import { Task } from '../../types'

type SortField = 'deadline' | 'priority' | 'estimatedPomos'
type SortOrder = 'asc' | 'desc'
type FilterStatus = typeof TASK_STATUS[number] | 'all'

const PRIORITY_ORDER: Record<string, number> = { High: 3, Medium: 2, Low: 1 }

export function TaskList() {
  const { tasks, activeTaskId, setActiveTask, removeTask } = useTaskStore()
  const { isRunning, toggleRunning, resetTimer } = useTimerStore()
  const { addToast } = useToast()

  const [sortField, setSortField] = useState<SortField>('deadline')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const handleStopTask = useCallback(() => {
    setActiveTask(null)
    resetTimer()
    addToast('Timer stopped and reset', 'success')
  }, [setActiveTask, resetTimer, addToast])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }, [sortField])

  const sortedAndFilteredTasks = useMemo(() => {
    let filteredTasks = tasks

    // Apply status filter
    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filterStatus)
    }

    // Apply sorting
    return [...filteredTasks].sort((a: Task, b: Task) => {
      let comparison = 0

      switch (sortField) {
        case 'deadline':
          // Handle null dates by placing them at the end
          if (!a.deadline && !b.deadline) {
            comparison = 0
          }
          else if (!a.deadline) {
            comparison = 1
          }
          else if (!b.deadline) {
            comparison = -1
          }
          else {
            comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          }
          break

        case 'priority':
          // Use priority order map with fallback
          const priorityA = PRIORITY_ORDER[a.priority] || 0
          const priorityB = PRIORITY_ORDER[b.priority] || 0
          comparison = priorityB - priorityA // Higher priority first
          break

        case 'estimatedPomos':
          // Handle undefined or zero values
          const pomosA = a.estimatedPomos || 0
          const pomosB = b.estimatedPomos || 0
          comparison = pomosA - pomosB
          break

        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [tasks, sortField, sortOrder, filterStatus])

  const handleRemoveTask = useCallback((taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      removeTask(taskId)
      addToast('Task deleted successfully', 'success')
    }
  }, [removeTask, addToast])

  const handleFocusTask = useCallback((taskId: string) => {
    setActiveTask(taskId)
    if (!isRunning) {
      toggleRunning()
    }
  }, [setActiveTask, isRunning, toggleRunning])

  if (!tasks) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Loading tasks...
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="region"
      aria-label="Task List"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <IconListCheck size={24} aria-hidden="true" />
            <h2 className="text-xl font-bold">Task Queue</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as FilterStatus)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Filter tasks by status"
            >
              <option value="all">All Tasks</option>
              {TASK_STATUS.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleSort('deadline')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-indigo-500"
              aria-label="Sort by deadline"
            >
              <span className="flex items-center gap-1">
                <IconCalendarEvent size={20} aria-hidden="true" />
                By Deadline {sortField === 'deadline' && (sortOrder === 'asc' ? '↑' : '↓')}
              </span>
            </button>

            <button
              onClick={() => handleSort('priority')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-indigo-500"
              aria-label="Sort by priority"
            >
              <span className="flex items-center gap-1">
                Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
              </span>
            </button>

            <button
              onClick={() => handleSort('estimatedPomos')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-indigo-500"
              aria-label="Sort by estimated pomodoros"
            >
              <span className="flex items-center gap-1">
                <IconClock size={20} aria-hidden="true" />
                Est. Pomos {sortField === 'estimatedPomos' && (sortOrder === 'asc' ? '↑' : '↓')}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {sortedAndFilteredTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  activeTaskId === task.id
                    ? 'bg-indigo-50 dark:bg-indigo-900 border-2 border-indigo-200 dark:border-indigo-700'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.priority === 'High'
                            ? 'bg-red-500'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        role="img"
                        aria-label={`Priority: ${task.priority}`}
                      />
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {task.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400" aria-label={`Progress: ${task.actualPomos} of ${task.estimatedPomos} pomodoros completed`}>
                        ({task.actualPomos}/{task.estimatedPomos} pomos)
                      </span>
                    </div>

                    {task.deadline && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <IconCalendarEvent size={16} aria-hidden="true" />
                        <span aria-label={`Deadline: ${formatDate(task.deadline)}`}>
                          {formatDate(task.deadline)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Time Spent
                      </span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400" aria-label={`Time spent: ${formatTime(task.timeSpent)}`}>
                        {formatTime(task.timeSpent)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {activeTaskId === task.id ? (
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleRunning}
                            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                            aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
                          >
                            {isRunning ? (
                              <IconPlayerPause size={20} aria-hidden="true" />
                            ) : (
                              <IconPlayerPlay size={20} aria-hidden="true" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStopTask}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500"
                            aria-label="Stop timer"
                          >
                            <IconPlayerStop size={20} aria-hidden="true" />
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFocusTask(task.id)}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500"
                          aria-label="Focus on this task"
                        >
                          <IconPlayerPlay size={20} aria-hidden="true" />
                        </motion.button>
                      )}

                      {task.deadline && (
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={createCalendarUrl(task)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 rounded-lg"
                          aria-label="Add to calendar"
                        >
                          <IconCalendarEvent size={20} aria-hidden="true" />
                        </motion.a>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemoveTask(task.id)}
                        className="p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg"
                        aria-label="Delete task"
                      >
                        <IconTrash size={20} aria-hidden="true" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {sortedAndFilteredTasks.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8" role="status">
              <p>No tasks found. Add some tasks to get started!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

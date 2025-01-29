'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { IconListCheck } from '@tabler/icons-react'
import { useTaskStore } from '../../store/taskStore'
import { useToast } from '../../hooks/useToast'
import { Task } from '../../types'
import { TASK_PRIORITIES } from '../../constants'

export function TaskForm() {
  const { addTask, updateTask, activeTaskId } = useTaskStore()
  const tasks = useTaskStore(state => state.tasks)
  const activeTask = tasks.find(t => t.id === activeTaskId)
  const { addToast } = useToast()

  const [task, setTask] = useState<Partial<Task>>({
    name: activeTask?.name || '',
    priority: activeTask?.priority || 'Medium',
    estimatedPomos: activeTask?.estimatedPomos || 1,
    actualPomos: activeTask?.actualPomos || 0,
    timeSpent: activeTask?.timeSpent || 0,
    description: activeTask?.description || '',
    deadline: activeTask?.deadline || null,
    labels: activeTask?.labels || [],
    status: activeTask?.status || 'todo'
  })

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    if (!task.name?.trim()) {
      addToast('Task name is required', 'error')
      return
    }

    const timestamp = Date.now()
    const now = new Date(timestamp).toISOString()

    if (activeTask) {
      const updatedTask: Task = {
        ...activeTask,
        name: task.name,
        priority: task.priority || 'Medium',
        estimatedPomos: task.estimatedPomos || 1,
        actualPomos: task.actualPomos || 0,
        timeSpent: task.timeSpent || 0,
        description: task.description || '',
        deadline: task.deadline || null,
        labels: task.labels || [],
        status: task.status || 'todo'
      }

      updateTask(updatedTask)
      addToast('Task updated successfully', 'success')
    } else {
      const newTask: Task = {
        id: timestamp.toString(),
        name: task.name,
        priority: task.priority || 'Medium',
        estimatedPomos: task.estimatedPomos || 1,
        actualPomos: 0,
        timeSpent: 0,
        description: task.description || '',
        deadline: task.deadline || null,
        labels: task.labels || [],
        status: 'todo',
        createdAt: now
      }

      const success = addTask(newTask)
      if (success) {
        addToast('Task added successfully', 'success')
      }
    }

    // Reset form
    setTask({
      name: '',
      priority: 'Medium',
      estimatedPomos: 1,
      description: '',
      deadline: null,
      labels: [],
      status: 'todo'
    })
  }, [task, activeTask, addTask, updateTask, addToast])

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setTask(prev => ({
      ...prev,
      [name]: name === 'estimatedPomos' ? parseInt(value) || 1 : value
    }))
  }, [])

  const handleReset = useCallback(() => {
    setTask({
      name: '',
      priority: 'Medium',
      estimatedPomos: 1,
      description: '',
      deadline: null,
      labels: [],
      status: 'todo'
    })
  }, [])

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        name="taskForm"
        aria-label="Task Form"
      >
        <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
          <IconListCheck size={24} aria-hidden="true" />
          <h2 id="formTitle" className="text-xl font-bold">
            {activeTask ? 'Update Task' : 'Add New Task'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Task Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={task.name || ''}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter task name..."
              required
              aria-required="true"
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={task.priority || 'Medium'}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {TASK_PRIORITIES.map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="estimatedPomos"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Estimated Pomodoros
            </label>
            <input
              type="number"
              id="estimatedPomos"
              name="estimatedPomos"
              value={task.estimatedPomos || 1}
              onChange={handleInputChange}
              min="1"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Deadline
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={task.deadline || ''}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={task.description || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add task description..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <motion.button
            type="button"
            onClick={handleReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
            aria-label="Reset form"
          >
            Reset
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <IconListCheck size={20} aria-hidden="true" />
            {activeTask ? 'Update Task' : 'Add Task'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

import Head from 'next/head'
import {
  Timer,
  TaskForm,
  TaskList,
  Settings,
  Analytics,
  KeyboardShortcuts,
  withErrorBoundary
} from '../src/components'
import { useKeyboardShortcuts } from '../src/hooks'

// Wrap each component with error boundary
const TimerWithError = withErrorBoundary(Timer)
const TaskFormWithError = withErrorBoundary(TaskForm)
const TaskListWithError = withErrorBoundary(TaskList)
const SettingsWithError = withErrorBoundary(Settings)
const AnalyticsWithError = withErrorBoundary(Analytics)

export default function Home() {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <>
      <Head>
        <title>Pomodoro Timer</title>
        <meta name="description" content="A productive Pomodoro timer with task management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TimerWithError />
          <TaskFormWithError />
        </div>

        <TaskListWithError />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnalyticsWithError />
          <SettingsWithError />
        </div>
      </main>

      {/* Keyboard Shortcuts Component */}
      <KeyboardShortcuts />

      {/* Hidden accessibility description of keyboard shortcuts */}
      <div className="sr-only" role="note">
        <h2>Keyboard Shortcuts:</h2>
        <ul>
          <li>Space - Start/Pause Timer</li>
          <li>Escape - Reset Timer</li>
          <li>N - New Task</li>
          <li>F - Focus on active task</li>
        </ul>
      </div>
    </>
  )
}

// Prevent hydration issues with localStorage
export const config = {
  unstable_runtimeJS: true
}

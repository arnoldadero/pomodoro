import { ErrorBoundary } from '../src/components/ErrorBoundary/ErrorBoundary'
import { ToastContainer } from '../src/components/Toast/ToastContainer'
import { useSettingsStore } from '../src/store/settingsStore'
import { useEffect } from 'react'
import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  const darkMode = useSettingsStore((state) => state.darkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Component {...pageProps} />
        <ToastContainer />
      </div>
    </ErrorBoundary>
  )
}

export default MyApp

'use client'

import React from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { SearchBar, Player } from '@/components'
import { SpotifyTrack } from '@/config/spotify'
import type { SearchResultsProps } from '@/components/SearchResults/SearchResults'
import type { SpotifyPlaylistProps } from '@/components/SpotifyPlaylist/SpotifyPlaylist'

// Proper type definitions for dynamic imports
const Timer = dynamic(() => import('@/components/Timer/Timer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent" />
    </div>
  )
})

const TaskList = dynamic(() => import('@/components/Task/TaskList').then(mod => mod.TaskList), {
  ssr: false,
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />
})

const TaskForm = dynamic(() => import('@/components/Task/TaskForm').then(mod => mod.TaskForm), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />
})

const Settings = dynamic(() => import('@/components/Settings/Settings'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />
})

const SearchResults = dynamic<SearchResultsProps>(() => import('@/components/SearchResults/SearchResults'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />
})

const SpotifyPlaylist = dynamic<SpotifyPlaylistProps>(() => import('@/components/SpotifyPlaylist/SpotifyPlaylist'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />
})

const Analytics = dynamic(() => import('@/components/Analytics/Analytics').then(mod => mod.Analytics), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />
})

const PLAYLIST_ID = '1qiZ90MU5r20d68rbXVyOU'

function useSpotifySearch() {
  const [tracks, setTracks] = React.useState<SpotifyTrack[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setTracks([])
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      const data = await response.json()
      setTracks(data)
    } catch (err) {
      setError('Failed to search tracks')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return { tracks, isLoading, error, handleSearch }
}

export default function Home() {
  const { tracks, isLoading, error, handleSearch } = useSpotifySearch()
  return (
    <div>
      <Head>
        <title>Pomodoro Timer</title>
        <meta name="description" content="A Pomodoro timer to help you stay focused and productive" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Pomodoro Timer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <Timer />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Settings />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Tasks</h2>
              <TaskForm />
              <div className="mt-6">
                <TaskList />
              </div>
              <div className="mt-8">
                <React.Suspense fallback={
                  <div className="text-center py-8 text-gray-500">
                    Loading analytics...
                  </div>
                }>
                  <Analytics />
                </React.Suspense>
              </div>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Focus Music</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Search Tracks</h3>
                  <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                  {error && (
                    <div className="mt-4 text-red-500 text-center">
                      {error}
                    </div>
                  )}
                  <div className="mt-4">
                    <SearchResults
                      tracks={tracks}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
                <SpotifyPlaylist playlistId={PLAYLIST_ID} height="400px" theme="0" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Player />
    </div>
  )
}

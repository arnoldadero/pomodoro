'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  IconSun,
  IconMoon,
  IconVolume,
  IconVolumeOff,
  IconSettings
} from '@tabler/icons-react'
import { useSettingsStore } from '../../store/settingsStore'
import { useToast } from '../../hooks/useToast'
import { requestNotificationPermission } from '../../utils'

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  const {
    darkMode,
    volume,
    spotifyTrack,
    toggleDarkMode,
    setVolume,
    setSpotifyTrack
  } = useSettingsStore()
  const { addToast } = useToast()

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }, [setVolume])

  const handleSpotifyTrackChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    // Extract track ID from Spotify URL if pasted
    const match = value.match(/track\/([a-zA-Z0-9]+)/)
    const trackId = match?.[1] ?? value
    setSpotifyTrack(trackId)
  }, [setSpotifyTrack])

  const handleRequestNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission()
    addToast(
      granted
        ? 'Notifications enabled successfully'
        : 'Could not enable notifications',
      granted ? 'success' : 'error'
    )
  }, [addToast])

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400">
        <IconSettings size={24} aria-hidden="true" />
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Toggle */}
        <div className="space-y-2">
          <label htmlFor="themeToggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <motion.button
            id="themeToggle"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="w-full p-3 flex items-center justify-between rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-pressed={darkMode}
          >
            <span className="text-gray-800 dark:text-gray-200">
              {darkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            {darkMode ? (
              <IconMoon size={20} className="text-yellow-500" aria-hidden="true" />
            ) : (
              <IconSun size={20} className="text-yellow-500" aria-hidden="true" />
            )}
          </motion.button>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <label
            htmlFor="volume"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Sound Volume
          </label>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 1)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label={volume > 0 ? 'Mute' : 'Unmute'}
            >
              {volume > 0 ? (
                <IconVolume size={20} aria-hidden="true" />
              ) : (
                <IconVolumeOff size={20} aria-hidden="true" />
              )}
            </button>
            <input
              type="range"
              id="volume"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              aria-label="Volume control"
            />
          </div>
        </div>

        {/* Music Integration */}
        <div className="space-y-2">
          <label
            htmlFor="spotifyTrack"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Spotify Track ID
          </label>
          <input
            type="text"
            id="spotifyTrack"
            value={spotifyTrack}
            onChange={handleSpotifyTrackChange}
            placeholder="Enter Spotify track ID or URL"
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Notification Permission */}
        <div className="space-y-2">
          <label htmlFor="notificationToggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Browser Notifications
          </label>
          <motion.button
            id="notificationToggle"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRequestNotifications}
            className="w-full p-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
          >
            Enable Notifications
          </motion.button>
        </div>
      </div>

      {/* Music Player */}
      {spotifyTrack && (
        <div className="mt-6">
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyTrack}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="encrypted-media"
            className="rounded-lg"
            title="Spotify music player"
          />
        </div>
      )}
    </motion.div>
  )
}

export default Settings

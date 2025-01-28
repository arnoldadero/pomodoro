import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SettingsState } from '../types'

interface SettingsActions {
  toggleDarkMode: () => void
  setSpotifyTrack: (track: string) => void
  setVolume: (volume: number) => void
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      darkMode: false,
      spotifyTrack: '',
      volume: 1,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setSpotifyTrack: (track) => set({ spotifyTrack: track }),
      setVolume: (volume) => set({ volume: Math.min(Math.max(volume, 0), 1) })
    }),
    {
      name: 'pomodoro-settings'
    }
  )
)

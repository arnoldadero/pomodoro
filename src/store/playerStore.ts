'use client'

import { create } from 'zustand'
import { SpotifyTrack } from '@/config/spotify'

interface PlayerState {
  currentTrack: SpotifyTrack | null
  isPlaying: boolean
  setTrack: (track: SpotifyTrack | null) => void
  play: () => void
  pause: () => void
  toggle: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  setTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
}))

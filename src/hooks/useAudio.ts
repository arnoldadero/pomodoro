'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useSettingsStore } from '../store/settingsStore'

interface UseAudioProps {
  src: string
  loop?: boolean
}

export function useAudio({ src, loop = false }: UseAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const volume = useSettingsStore((state) => state.volume)

  useEffect(() => {
    // Only create Audio instance on client-side
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(src)
      audioRef.current.loop = loop
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [src, loop])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const play = useCallback(() => {
    if (audioRef.current) {
      // Reset the audio to the beginning if it's already playing
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error)
      })
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  return {
    play,
    pause,
    stop
  }
}

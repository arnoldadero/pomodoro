'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useAudio } from '@/hooks/useAudio'
import { usePlayerStore } from '@/store/playerStore'
import { useToast } from '@/hooks/useToast'
import { Icon } from '@iconify/react'

export function Player() {
  const { currentTrack, isPlaying, toggle, pause } = usePlayerStore()
  const { addToast } = useToast()

  const audio = useAudio({
    src: currentTrack?.preview_url || '',
    loop: false,
  })

  useEffect(() => {
    if (isPlaying && currentTrack?.preview_url) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack, audio])

  // Handle end of preview
  useEffect(() => {
    const handleEnded = () => {
      pause()
    }

    const audioElement = document.querySelector('audio')
    audioElement?.addEventListener('ended', handleEnded)

    return () => {
      audioElement?.removeEventListener('ended', handleEnded)
    }
  }, [pause])

  if (!currentTrack) {
    return null
  }

  // Don't show player if track has no preview
  if (!currentTrack.preview_url) {
    addToast('This track does not have a preview available.', 'error')
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={currentTrack.album.images[2]?.url || '/placeholder-album.png'}
            alt={`${currentTrack.album.name} cover`}
            width={48}
            height={48}
            className="rounded shadow"
          />
          <div>
            <h3 className="font-medium text-gray-900">{currentTrack.name}</h3>
            <p className="text-sm text-gray-500">
              {currentTrack.artists.map(a => a.name).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => toggle()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <Icon
              icon={isPlaying ? 'mdi:pause' : 'mdi:play'}
              className="w-6 h-6 text-gray-700"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

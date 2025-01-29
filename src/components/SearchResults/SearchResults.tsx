'use client'

import React from 'react'
import Image from 'next/image'
import { SpotifyTrack } from '@/config/spotify'
import { usePlayerStore } from '@/store/playerStore'

export interface SearchResultsProps {
  tracks: SpotifyTrack[]
  isLoading?: boolean
}

const SearchResults: React.FC<SearchResultsProps> = ({ tracks, isLoading = false }) => {
  const { setTrack } = usePlayerStore()
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto mt-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto mt-4 text-center text-gray-500">
        No tracks found
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4 space-y-2">
      {tracks.map((track) => (
        <button
          key={track.id}
          onClick={() => setTrack(track)}
          className="w-full p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left"
        >
          <div className="flex items-center gap-4">
            <Image
              src={track.album.images[2]?.url || '/placeholder-album.png'}
              alt={`${track.album.name} cover`}
              width={48}
              height={48}
              className="rounded"
            />
            <div>
              <h3 className="font-medium text-gray-900">{track.name}</h3>
              <p className="text-sm text-gray-500">
                {track.artists.map(a => a.name).join(', ')}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default SearchResults

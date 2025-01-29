'use client'

import React from 'react'

export interface SpotifyPlaylistProps {
  playlistId: string
  theme?: '0' | '1'  // 0 for dark, 1 for light
  height?: string | number
}

const SpotifyPlaylist: React.FC<SpotifyPlaylistProps> = ({
  playlistId,
  theme = '0',
  height = '360px'
}) => (
  <div className="w-full">
    <iframe
      title="Spotify Embed: Recommendation Playlist"
      src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=${theme}`}
      width="100%"
      height="100%"
      style={{ minHeight: height }}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  </div>
)

export default SpotifyPlaylist

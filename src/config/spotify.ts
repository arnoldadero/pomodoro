export const SPOTIFY_API = {
  AUTH_URL: 'https://accounts.spotify.com/api/token',
  SEARCH_URL: 'https://api.spotify.com/v1/search',
  CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  preview_url: string | null
}

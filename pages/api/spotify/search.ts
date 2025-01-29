import type { NextApiRequest, NextApiResponse } from 'next'
import { SPOTIFY_API, SpotifyTrack } from '@/config/spotify'

interface SpotifyAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

async function getAccessToken(): Promise<string> {
  if (!SPOTIFY_API.CLIENT_ID || !SPOTIFY_API.CLIENT_SECRET) {
    throw new Error('Missing Spotify credentials. Please check your .env.local file.')
  }

  const basic = Buffer.from(
    `${SPOTIFY_API.CLIENT_ID}:${SPOTIFY_API.CLIENT_SECRET}`
  ).toString('base64')

  try {
    const response = await fetch(SPOTIFY_API.AUTH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Spotify auth error:', {
        status: response.status,
        statusText: response.statusText,
        error
      })
      throw new Error('Failed to authenticate with Spotify')
    }

    const data: SpotifyAuthResponse = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Token fetch error:', error)
    throw new Error('Failed to get Spotify access token')
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { q: query } = req.query

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'Query parameter is required' })
  }

  try {
    const token = await getAccessToken()
    const searchParams = new URLSearchParams({
      q: query,
      type: 'track',
      limit: '10',
    })

    const response = await fetch(
      `${SPOTIFY_API.SEARCH_URL}?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Spotify search error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(
        `Spotify API error: ${errorData.error?.message || response.statusText}`
      )
    }

    const data: SpotifySearchResponse = await response.json()
    res.status(200).json(data.tracks.items)
  } catch (error) {
    console.error('Spotify API error:', error)
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
      error: 'Failed to fetch from Spotify API'
    })
  }
}

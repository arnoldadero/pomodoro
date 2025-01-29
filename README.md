## Spotify Integration Setup
# Pomodoro Timer with Focus Music

A Pomodoro timer application with Spotify integration for focus music.

## Features

- 🕒 Pomodoro Timer
  - Work sessions (25 minutes)
  - Short breaks (5 minutes)
  - Long breaks (15 minutes)
  - Visual progress indicator
  - Task tracking with estimated and actual pomodoros

- 🎵 Focus Music Integration
  - Spotify track search
  - Featured playlist integration
  - Volume control through settings
  - Audio preview for tracks

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Spotify API credentials:
   - Go to https://developer.spotify.com/dashboard
   - Log in with your Spotify account
   - Click "Create app"
   - Fill in app details:
     - App name: "Pomodoro Focus Music"
     - App description: "Music integration for Pomodoro timer"
     - Redirect URI: "http://localhost:3000"
     - Select "Web API"
   - After creation, get the Client ID and Client Secret
   - Create a `.env.local` file with:
     ```
     NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
     SPOTIFY_CLIENT_SECRET=your_client_secret_here
     ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Recent Updates
- Fixed timer progress circle calculation
- Updated package dependencies to stable versions
- Improved audio management with custom hook
- Enhanced Spotify integration UI

To enable Spotify track search functionality:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application or select an existing one
3. Get your Client ID and Client Secret from the app settings
4. Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   ```
5. Replace the placeholder values with your actual Spotify API credentials
6. Restart your development server for the changes to take effect

### Features
- Search for tracks in real-time as you type
- View track details including artist and album art
- Play preview clips when available (30 seconds)

### Troubleshooting

If you encounter issues:

1. Verify your credentials:
   - Make sure both CLIENT_ID and CLIENT_SECRET are correctly copied from Spotify
   - Check that there are no extra spaces in your .env.local file
   - Ensure the .env.local file is in the root directory

2. Common errors:
   - "Missing Spotify credentials": Check your .env.local file setup
   - "Failed to authenticate": Verify your credentials are correct
   - "API rate limit exceeded": Spotify has rate limits for free tier:
     * 30 requests per second
     * 3,600 requests per hour
     * Implement caching if needed for heavy usage

3. Development tips:
   - Check the browser console and server logs for detailed error messages
   - The search is debounced (300ms) to prevent API spam
   - Preview playback requires user interaction due to browser policies
   - Album art uses Spotify's CDN (i.scdn.co) which is configured in next.config.js

For more details, see the [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)

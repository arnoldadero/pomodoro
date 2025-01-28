import { act, renderHook } from '@testing-library/react'
import { useSettingsStore } from '@/store/settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSettingsStore())
    // Reset to initial state
    act(() => {
      result.current.setVolume(1)
      result.current.setSpotifyTrack('')
      if (result.current.darkMode) {
        result.current.toggleDarkMode()
      }
    })
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useSettingsStore())

      expect(result.current.darkMode).toBeFalsy()
      expect(result.current.spotifyTrack).toBe('')
      expect(result.current.volume).toBe(1)
    })
  })

  describe('dark mode', () => {
    it('should toggle dark mode', () => {
      const { result } = renderHook(() => useSettingsStore())

      act(() => {
        result.current.toggleDarkMode()
      })
      expect(result.current.darkMode).toBeTruthy()

      act(() => {
        result.current.toggleDarkMode()
      })
      expect(result.current.darkMode).toBeFalsy()
    })
  })

  describe('spotify track', () => {
    it('should set spotify track', () => {
      const { result } = renderHook(() => useSettingsStore())
      const testTrack = 'spotify:track:123456'

      act(() => {
        result.current.setSpotifyTrack(testTrack)
      })

      expect(result.current.spotifyTrack).toBe(testTrack)
    })

    it('should allow empty track', () => {
      const { result } = renderHook(() => useSettingsStore())

      act(() => {
        result.current.setSpotifyTrack('')
      })

      expect(result.current.spotifyTrack).toBe('')
    })
  })

  describe('volume', () => {
    it('should set volume within valid range', () => {
      const { result } = renderHook(() => useSettingsStore())
      const testVolume = 0.5

      act(() => {
        result.current.setVolume(testVolume)
      })

      expect(result.current.volume).toBe(testVolume)
    })

    it('should clamp volume to minimum of 0', () => {
      const { result } = renderHook(() => useSettingsStore())

      act(() => {
        result.current.setVolume(-0.5)
      })

      expect(result.current.volume).toBe(0)
    })

    it('should clamp volume to maximum of 1', () => {
      const { result } = renderHook(() => useSettingsStore())

      act(() => {
        result.current.setVolume(1.5)
      })

      expect(result.current.volume).toBe(1)
    })

    it('should handle edge cases', () => {
      const { result } = renderHook(() => useSettingsStore())

      act(() => {
        result.current.setVolume(0)
      })
      expect(result.current.volume).toBe(0)

      act(() => {
        result.current.setVolume(1)
      })
      expect(result.current.volume).toBe(1)
    })
  })
})

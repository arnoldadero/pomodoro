import { renderHook, act } from '@testing-library/react'
import { useAudio } from '@/hooks/useAudio'
import { useSettingsStore } from '@/store/settingsStore'

// Mock the Audio API
const mockPlay = jest.fn().mockImplementation(() => Promise.resolve())
const mockPause = jest.fn()
let currentTime = 0
let currentVolume = 1
let currentLoop = false

beforeEach(() => {
  // Reset all mocks and values before each test
  mockPlay.mockClear()
  mockPause.mockClear()
  currentTime = 0
  currentVolume = 1
  currentLoop = false

  // Mock the Audio constructor
  global.Audio = jest.fn().mockImplementation((src) => ({
    src,
    play: mockPlay,
    pause: mockPause,
    get currentTime() {
      return currentTime
    },
    set currentTime(value) {
      currentTime = value
    },
    get volume() {
      return currentVolume
    },
    set volume(value) {
      currentVolume = value
    },
    get loop() {
      return currentLoop
    },
    set loop(value) {
      currentLoop = value
    }
  }))
})

describe('useAudio', () => {
  const testSrc = '/test-audio.mp3'

  describe('initialization', () => {
    it('should initialize with correct src', () => {
      renderHook(() => useAudio({ src: testSrc }))
      expect(Audio).toHaveBeenCalledWith(testSrc)
    })

    it('should set loop property correctly', () => {
      renderHook(() => useAudio({ src: testSrc, loop: true }))
      expect(currentLoop).toBeTruthy()

      renderHook(() => useAudio({ src: testSrc, loop: false }))
      expect(currentLoop).toBeFalsy()
    })
  })

  describe('volume control', () => {
    it('should update volume when settings change', () => {
      const { result: settingsResult } = renderHook(() => useSettingsStore())
      renderHook(() => useAudio({ src: testSrc }))

      act(() => {
        settingsResult.current.setVolume(0.5)
      })

      expect(currentVolume).toBe(0.5)
    })
  })

  describe('playback controls', () => {
    it('should play audio from the beginning', () => {
      const { result } = renderHook(() => useAudio({ src: testSrc }))

      act(() => {
        currentTime = 10 // Simulate audio that has been playing
        result.current.play()
      })

      expect(currentTime).toBe(0) // Should reset to beginning
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('should pause audio', () => {
      const { result } = renderHook(() => useAudio({ src: testSrc }))

      act(() => {
        result.current.pause()
      })

      expect(mockPause).toHaveBeenCalledTimes(1)
    })

    it('should stop audio and reset time', () => {
      const { result } = renderHook(() => useAudio({ src: testSrc }))

      act(() => {
        currentTime = 30 // Simulate some playback time
        result.current.stop()
      })

      expect(mockPause).toHaveBeenCalled()
      expect(currentTime).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should handle play errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPlay.mockRejectedValueOnce(new Error('Play failed'))

      const { result } = renderHook(() => useAudio({ src: testSrc }))

      await act(async () => {
        result.current.play()
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error playing audio:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useAudio({ src: testSrc }))

      unmount()

      expect(mockPause).toHaveBeenCalled()
    })

    it('should cleanup when src changes', () => {
      const { rerender } = renderHook(
        ({ src }) => useAudio({ src }),
        { initialProps: { src: testSrc } }
      )

      rerender({ src: '/new-audio.mp3' })

      expect(mockPause).toHaveBeenCalled()
    })
  })
})

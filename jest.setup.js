import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

// Mock timers globally
beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2025-01-01'))
})

afterEach(() => {
  jest.useRealTimers()
  jest.clearAllMocks()
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [0],
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = cb => setTimeout(cb, 0)
global.cancelAnimationFrame = jest.fn()

// Mock AudioContext
class AudioContextMock {
  createGain() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: { value: 1 },
    }
  }
  createMediaElementSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    }
  }
}
global.AudioContext = AudioContextMock

// Mock Notification API
global.Notification = {
  requestPermission: jest.fn().mockResolvedValue('granted'),
  permission: 'granted'
}

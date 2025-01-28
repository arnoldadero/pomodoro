import { render, screen, fireEvent } from '@testing-library/react'
import { Settings } from '../../src/components/Settings/Settings'
import { useSettingsStore } from '../../src/store/settingsStore'
import { useToast } from '../../src/hooks/useToast'
import { requestNotificationPermission } from '../../src/utils'

// Mock dependencies
jest.mock('../../src/store/settingsStore')
jest.mock('../../src/hooks/useToast')
jest.mock('../../src/utils', () => ({
  requestNotificationPermission: jest.fn()
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    )
  }
}))

const mockUseSettingsStore = useSettingsStore as jest.MockedFunction<typeof useSettingsStore>

const mockSettingsStore = {
  darkMode: false,
  volume: 0.5,
  spotifyTrack: '',
  toggleDarkMode: jest.fn(),
  setVolume: jest.fn(),
  setSpotifyTrack: jest.fn()
}

const mockToast = {
  addToast: jest.fn()
}

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSettingsStore.mockReturnValue(mockSettingsStore)
    ;(useToast as jest.Mock).mockReturnValue(mockToast)
  })

  it('renders settings with all controls', () => {
    render(<Settings />)

    // Check main sections are rendered
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Sound Volume')).toBeInTheDocument()
    expect(screen.getByText('Spotify Track ID')).toBeInTheDocument()
    expect(screen.getByText('Browser Notifications')).toBeInTheDocument()
  })

  describe('Theme Toggle', () => {
    it('displays correct theme state and toggles theme', () => {
      render(<Settings />)

      const themeButton = screen.getByText('Light Mode')
      expect(themeButton).toBeInTheDocument()

      fireEvent.click(themeButton)
      expect(mockSettingsStore.toggleDarkMode).toHaveBeenCalledTimes(1)
    })

    it('shows correct icon based on theme', () => {
      mockUseSettingsStore.mockReturnValue({
        ...mockSettingsStore,
        darkMode: true
      })

      render(<Settings />)
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    })
  })

  describe('Volume Control', () => {
    it('handles volume change through slider', () => {
      render(<Settings />)

      const volumeSlider = screen.getByLabelText('Volume control')
      fireEvent.change(volumeSlider, { target: { value: '0.7' } })

      expect(mockSettingsStore.setVolume).toHaveBeenCalledWith(0.7)
    })

    it('toggles mute state correctly', () => {
      render(<Settings />)

      const muteButton = screen.getByLabelText('Mute')
      fireEvent.click(muteButton)

      expect(mockSettingsStore.setVolume).toHaveBeenCalledWith(0)
    })
  })

  describe('Spotify Integration', () => {
    it('handles spotify track ID input', () => {
      render(<Settings />)

      const trackInput = screen.getByLabelText('Spotify Track ID')
      fireEvent.change(trackInput, {
        target: { value: 'https://open.spotify.com/track/123456' }
      })

      expect(mockSettingsStore.setSpotifyTrack).toHaveBeenCalledWith('123456')
    })

    it('displays spotify player when track ID is present', () => {
      mockUseSettingsStore.mockReturnValue({
        ...mockSettingsStore,
        spotifyTrack: '123456'
      })

      render(<Settings />)
      const player = screen.getByTitle('Spotify music player')
      expect(player).toBeInTheDocument()
      expect(player).toHaveAttribute(
        'src',
        'https://open.spotify.com/embed/track/123456'
      )
    })
  })

  describe('Notification Permission', () => {
    it('requests notification permission and shows success toast', async () => {
      (requestNotificationPermission as jest.Mock).mockResolvedValue(true)

      render(<Settings />)

      const notifyButton = screen.getByText('Enable Notifications')
      fireEvent.click(notifyButton)

      expect(requestNotificationPermission).toHaveBeenCalled()

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockToast.addToast).toHaveBeenCalledWith(
        'Notifications enabled successfully',
        'success'
      )
    })

    it('shows error toast when notification permission is denied', async () => {
      (requestNotificationPermission as jest.Mock).mockResolvedValue(false)

      render(<Settings />)

      const notifyButton = screen.getByText('Enable Notifications')
      fireEvent.click(notifyButton)

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockToast.addToast).toHaveBeenCalledWith(
        'Could not enable notifications',
        'error'
      )
    })
  })

  describe('Styling', () => {
    it('applies correct classes to main container', () => {
      render(<Settings />)
      const container = screen.getByText('Settings').closest('div')
      expect(container).toHaveClass(
        'bg-white',
        'dark:bg-gray-800',
        'rounded-2xl',
        'p-6',
        'shadow-xl'
      )
    })

    it('styles settings header correctly', () => {
      render(<Settings />)
      const header = screen.getByText('Settings')
      const headerContainer = header.parentElement
      expect(headerContainer).toHaveClass(
        'flex',
        'items-center',
        'gap-2',
        'mb-6',
        'text-indigo-600',
        'dark:text-indigo-400'
      )
    })

    it('applies correct layout to settings grid', () => {
      render(<Settings />)
      const grid = screen.getByText('Settings').closest('div')?.nextElementSibling
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'gap-6'
      )
    })
  })
})

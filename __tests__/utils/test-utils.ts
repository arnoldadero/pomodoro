import { render, RenderOptions } from '@testing-library/react'
import { axe, JestAxeConfigureOptions } from 'jest-axe'
import { AnimatePresence } from 'framer-motion'
import { create, StateCreator } from 'zustand'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react'
import React, { ReactElement } from 'react'

// Extend expect with jest-axe matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R
    }
  }
}

type TestProvidersProps = {
  children: React.ReactNode
}

export const TestProviders = ({ children }: TestProvidersProps) => {
  return React.createElement(AnimatePresence, { mode: "wait" }, children)
}

export const renderWithProviders = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) => {
  return render(ui, {
    wrapper: TestProviders,
    ...options,
  })
}

export const renderWithAnimation = (ui: ReactElement) => {
  return render(
    React.createElement(AnimatePresence, { mode: "wait" }, ui)
  )
}

export const checkA11y = async (ui: ReactElement, rules?: JestAxeConfigureOptions) => {
  const { container } = render(ui)
  const results = await axe(container, {
    rules: {
      // Common overrides for false positives
      'aria-allowed-role': { enabled: false },
      ...rules
    }
  })
  expect(results).toHaveNoViolations()
  return container
}

export const testAnimatedComponent = async (ui: ReactElement) => {
  const { container } = renderWithAnimation(ui)

  // Wait for animations to complete
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  return container
}

export const setupUserEvent = () => {
  return userEvent.setup({
    delay: null,
    skipHover: false,
    pointerEventsCheck: 0 // 0 = disabled, 1 = warning, 2 = error
  })
}

export const checkDecorativeElements = async (container: HTMLElement) => {
  const decorativeElements = container.querySelectorAll('[aria-hidden="true"]')
  decorativeElements.forEach(element => {
    expect(element).toHaveAttribute('aria-hidden', 'true')

    // Check that screen readers will skip this element
    const role = element.getAttribute('role')
    if (role) {
      expect(role).toBe('presentation')
    }
  })
  return decorativeElements
}

export const setupTestStore = <T extends object>(
  createStore: StateCreator<T, [], []>,
  defaultInitialState?: Partial<T>
) => {
  const store = create(createStore)
  const initialState = defaultInitialState || {}

  return {
    store,
    reset: () => store.setState(initialState),
    getState: () => store.getState(),
  }
}

export const mockDateNow = (date: string | number | Date = '2025-01-01') => {
  const mockDate = new Date(date).getTime()
  jest.spyOn(Date, 'now').mockImplementation(() => mockDate)
  return mockDate
}

export const cleanupDateMock = () => {
  jest.restoreAllMocks()
}

export const testToastDismissal = async (timeoutMs: number = 3000) => {
  await act(async () => {
    jest.advanceTimersByTime(timeoutMs)
    await new Promise(resolve => setTimeout(resolve, 0))
  })
}

export const mockDateTime = (date: string | number | Date = '2024-01-20') => {
  const timestamp = new Date(date).getTime()
  const mockNow = jest.spyOn(Date, 'now')
  const mockGetTime = jest.spyOn(Date.prototype, 'getTime')

  mockNow.mockImplementation(() => timestamp)
  mockGetTime.mockImplementation(() => timestamp)

  return timestamp
}

export const waitForAnimation = async (timeout = 100) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, timeout))
  })
}

export const verifyAccessibility = async (element: HTMLElement, options = {}) => {
  const results = await axe(element, {
    rules: {
      'aria-allowed-role': { enabled: false },
      ...options
    }
  })
  expect(results).toHaveNoViolations()
  return results
}

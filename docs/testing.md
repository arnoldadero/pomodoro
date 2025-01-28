# Testing Architecture

## Overview
The Pomodoro application uses Jest and React Testing Library for testing. The testing architecture follows these principles:

1. **Unit Tests**: For testing individual components, hooks, and utilities in isolation
2. **Integration Tests**: For testing interactions between components and state management
3. **Store Tests**: For testing Zustand store logic
4. **Hook Tests**: For testing custom hooks
5. **Component Tests**: For testing React components

## Test Structure
```
__tests__/
├── components/       # Component tests
├── hooks/           # Custom hook tests
├── store/           # Zustand store tests
├── utils/           # Utility function tests
└── pages/           # Page component tests
```

## Testing Guidelines

### Components
- Test user interactions using `@testing-library/user-event`
- Test accessibility using jest-axe
- Test both success and error states
- Test loading states where applicable

### Hooks
- Use `renderHook` from `@testing-library/react-hooks`
- Test hook initialization
- Test state updates
- Test cleanup functions

### Stores
- Test initial state
- Test all actions and state updates
- Test complex state interactions
- Mock external dependencies

### Utilities
- Test input validation
- Test edge cases
- Test error handling

## Best Practices
1. Use meaningful test descriptions
2. Follow AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Test accessibility concerns
5. Keep tests focused and isolated
6. Use proper cleanup after each test

## Setup Files

### jest.config.js
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
  }
}

module.exports = createJestConfig(customJestConfig)
```

### jest.setup.js
```javascript
import '@testing-library/jest-dom'

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

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})
```

## Example Test Pattern
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('ComponentName', () => {
  it('should render successfully', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    render(<ComponentName />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})

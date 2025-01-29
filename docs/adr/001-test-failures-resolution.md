# ADR 001: Test Failures Resolution Plan

## Context

Test results analysis shows 10 failed test suites out of 20 total suites, with 30 failed tests out of 199 total tests. The failures cluster around several key areas that require architectural decisions to resolve.

## Current Status

- **Pass Rate**: 84.9% (169/199 tests)
- **Failed Test Suites**: 50% (10/20)
- **Execution Time**: 14.241s

## Key Issue Categories

### 1. Date/Time Handling
- **Problems**:
  - Date.now mocking inconsistencies in TaskForm tests
  - formatDate implementation causing stack overflow
  - Time-dependent test failures
- **Solution**:
  ```typescript
  // Implement in test setup
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-01'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })
  ```

### 2. Component Props & Animation
- **Problems**:
  - Framer Motion props (whileHover, whileTap) testing issues
  - AnimatePresence implementation problems
  - Layout attribute conflicts
- **Solution**:
  ```typescript
  // Create test utilities for animation testing
  const renderWithAnimation = (ui: React.ReactElement) => {
    return render(
      <AnimatePresence mode="wait">
        {ui}
      </AnimatePresence>
    )
  }

  // Mock Framer Motion
  jest.mock('framer-motion', () => ({
    ...jest.requireActual('framer-motion'),
    motion: {
      div: 'div',
      // Add other elements as needed
    }
  }))
  ```

### 3. Accessibility
- **Problems**:
  - Missing ARIA labels
  - Screen reader compatibility
  - Semantic heading structure
- **Solution**:
  ```typescript
  // Create accessibility test utilities
  const checkA11y = async (ui: React.ReactElement) => {
    const { container } = render(ui)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  }
  ```

### 4. State Management
- **Problems**:
  - Task sorting inconsistencies
  - Toast auto-dismissal timing
  - Keyboard shortcut handling
- **Solution**:
  ```typescript
  // Implement test store setup
  const setupTestStore = () => {
    const store = create(yourStore)
    return {
      store,
      reset: () => store.setState(initialState)
    }
  }
  ```

## Architectural Decisions

1. **Test Infrastructure Enhancement**
   - Implement global Jest setup file for common mocks
   - Create utility functions for commonly needed test operations
   - Add type-safe test fixtures

2. **Component Test Architecture**
   - Separate animation logic into testable units
   - Abstract time-dependent operations
   - Create higher-order test components for common testing scenarios

3. **State Testing Strategy**
   - Use isolated store instances for each test
   - Mock time-based operations consistently
   - Implement snapshot testing for complex state changes

4. **Accessibility Testing Pipeline**
   - Add automated accessibility checks to CI
   - Create accessibility test helpers
   - Define accessibility testing patterns

## Implementation Plan

1. **Immediate Fixes**
   ```typescript
   // jest.setup.js
   import '@testing-library/jest-dom'
   import 'jest-axe/extend-expect'

   global.ResizeObserver = jest.fn().mockImplementation(() => ({
     observe: jest.fn(),
     unobserve: jest.fn(),
     disconnect: jest.fn(),
   }))
   ```

2. **Test Helper Functions**
   ```typescript
   // test-utils.ts
   export const renderWithProviders = (
     ui: React.ReactElement,
     options = {}
   ) => {
     return {
       ...render(ui, {
         wrapper: ({ children }) => (
           <TestProviders>{children}</TestProviders>
         ),
         ...options,
       })
     }
   }
   ```

3. **Mock Implementation Examples**
   ```typescript
   // __mocks__/framer-motion.ts
   const actual = jest.requireActual('framer-motion')

   module.exports = {
     ...actual,
     AnimatePresence: ({ children }) => children,
     motion: new Proxy({}, {
       get: (_, prop) => prop === '__esModule' ? false : actual.motion[prop]
     })
   }
   ```

## Migration Strategy

1. Update test files in this order:
   - Utils (foundational tests)
   - Hooks (core functionality)
   - Components (UI elements)
   - Integration tests

2. Implement fixes incrementally:
   - Add test infrastructure improvements
   - Update individual test suites
   - Refactor components for testability
   - Add missing accessibility tests

## Success Metrics

- Test suite execution time under 15 seconds
- 100% test pass rate
- Zero accessibility violations
- Consistent test behavior across CI/CD environments

## Future Considerations

1. Consider moving to Vitest for faster execution
2. Implement visual regression testing
3. Add performance benchmarking to critical components
4. Enhance error boundary testing coverage

import { useAudio, useToast, useKeyboardShortcuts } from '../../src/hooks'

describe('hooks/index', () => {
  it('should export useAudio hook', () => {
    expect(useAudio).toBeDefined()
  })

  it('should export useToast hook', () => {
    expect(useToast).toBeDefined()
  })

  it('should export useKeyboardShortcuts hook', () => {
    expect(useKeyboardShortcuts).toBeDefined()
  })

  it('should export the correct number of hooks', () => {
    const exports = Object.keys(require('../../src/hooks'))
    expect(exports).toHaveLength(3)
    expect(exports).toEqual(['useAudio', 'useToast', 'useKeyboardShortcuts'])
  })
})

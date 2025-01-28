describe('components/index', () => {
  it('should export modules without errors', () => {
    expect(() => import('../../src/components')).not.toThrow();
  });
});

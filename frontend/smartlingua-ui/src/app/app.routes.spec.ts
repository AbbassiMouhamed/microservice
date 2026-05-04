describe('frontend smoke test', () => {
  it('should execute a basic assertion', () => {
    const appName = 'smartlingua-ui';
    expect(appName).toContain('smartlingua');
  });
});

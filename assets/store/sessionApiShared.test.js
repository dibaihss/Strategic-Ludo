describe('sessionApiShared warm-up helper', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_E2E;
    delete process.env.REACT_APP_E2E;
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('warms the backend only once per app process', async () => {
    const { BACKEND_WARMUP_URL, warmBackendOnAppOpen } = require('./sessionApiShared.jsx');

    const firstAttempt = await warmBackendOnAppOpen();
    const secondAttempt = await warmBackendOnAppOpen();

    expect(firstAttempt).toBe(true);
    expect(secondAttempt).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      BACKEND_WARMUP_URL,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      })
    );
  });
});
import { LOCK_AFTER_MS, shouldLock } from './app-lock';

describe('shouldLock', () => {
  it('locks only when enabled and away for the grace period', () => {
    expect(shouldLock(true, 0, LOCK_AFTER_MS)).toBe(true);
    expect(shouldLock(true, 0, LOCK_AFTER_MS - 1)).toBe(false);
    expect(shouldLock(false, 0, LOCK_AFTER_MS * 10)).toBe(false);
    expect(shouldLock(true, null, LOCK_AFTER_MS * 10)).toBe(false);
  });
});

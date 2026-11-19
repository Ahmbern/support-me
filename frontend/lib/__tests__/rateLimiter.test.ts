import { describe, it, expect } from 'vitest';
import { RateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
  it('allows up to the configured max within the window', () => {
    const limiter = new RateLimiter(3, 60_000);
    expect(limiter.attempt('a')).toBe(true);
    expect(limiter.attempt('a')).toBe(true);
    expect(limiter.attempt('a')).toBe(true);
    expect(limiter.attempt('a')).toBe(false);
  });

  it('tracks each key independently', () => {
    const limiter = new RateLimiter(1, 60_000);
    expect(limiter.attempt('a')).toBe(true);
    expect(limiter.attempt('b')).toBe(true);
    expect(limiter.attempt('a')).toBe(false);
    expect(limiter.attempt('b')).toBe(false);
  });

  it('reports 0 retryAfterSeconds when under the limit', () => {
    const limiter = new RateLimiter(2, 60_000);
    limiter.attempt('a');
    expect(limiter.retryAfterSeconds('a')).toBe(0);
  });

  it('reports a positive retryAfterSeconds once limited', () => {
    const limiter = new RateLimiter(1, 60_000);
    limiter.attempt('a');
    limiter.attempt('a');
    expect(limiter.retryAfterSeconds('a')).toBeGreaterThan(0);
  });

  it('allows a key again once the window has elapsed', async () => {
    const limiter = new RateLimiter(1, 10);
    expect(limiter.attempt('a')).toBe(true);
    expect(limiter.attempt('a')).toBe(false);
    await new Promise((r) => setTimeout(r, 20));
    expect(limiter.attempt('a')).toBe(true);
  });

  it('clear() resets all keys', () => {
    const limiter = new RateLimiter(1, 60_000);
    limiter.attempt('a');
    expect(limiter.attempt('a')).toBe(false);
    limiter.clear();
    expect(limiter.attempt('a')).toBe(true);
  });
});

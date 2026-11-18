/**
 * A minimal in-process, fixed-window rate limiter for Next.js API routes
 * (#364). Mirrors backend/src/services/rateLimiter.ts's algorithm — this
 * package can't import across the frontend/backend boundary, so the same
 * approach is kept here instead of pulling in an external dependency (no
 * Redis, no extra package) for a single-instance deployment.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  /**
   * Records a request attempt for `key` and returns whether it's allowed
   * under the limit. Old timestamps outside the current window are pruned
   * on every call for the key being attempted.
   */
  attempt(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const existing = (this.hits.get(key) ?? []).filter((t) => t > windowStart);

    if (existing.length >= this.maxRequests) {
      this.hits.set(key, existing);
      return false;
    }

    existing.push(now);
    this.hits.set(key, existing);
    return true;
  }

  /** Whole seconds (>= 1) until `key` may try again; 0 when not limited. */
  retryAfterSeconds(key: string): number {
    const now = Date.now();
    const inWindow = (this.hits.get(key) ?? []).filter((t) => t > now - this.windowMs);
    if (inWindow.length < this.maxRequests) return 0;
    return Math.max(1, Math.ceil((inWindow[0] + this.windowMs - now) / 1000));
  }

  clear(): void {
    this.hits.clear();
  }
}

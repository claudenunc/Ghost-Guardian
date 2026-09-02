/**
 * Ghost Guardian — Rate Limiter Utility
 * Enforces maximum 100 requests per IP per hour.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const MAX_REQUESTS = 100; // max requests per window per IP

class RateLimiter {
  constructor({ windowMs = WINDOW_MS, maxRequests = MAX_REQUESTS } = {}) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.records = new Map(); // IP -> Array of timestamps

    // Cleanup stale records periodically
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000).unref?.();
  }

  getClientIp(req) {
    const forwarded = req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'];
    if (forwarded) {
      return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
    }
    return (
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, timestamps] of this.records.entries()) {
      const valid = timestamps.filter((t) => now - t < this.windowMs);
      if (valid.length === 0) {
        this.records.delete(ip);
      } else {
        this.records.set(ip, valid);
      }
    }
  }

  /**
   * Checks if an IP is within rate limits.
   * @param {string} ip
   * @returns {{ allowed: boolean, remaining: number, resetTime: number, total: number }}
   */
  check(ip) {
    const now = Date.now();
    const timestamps = (this.records.get(ip) || []).filter((t) => now - t < this.windowMs);

    if (timestamps.length >= this.maxRequests) {
      const earliest = timestamps[0];
      const resetTime = earliest + this.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        total: timestamps.length,
      };
    }

    timestamps.push(now);
    this.records.set(ip, timestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      resetTime: now + this.windowMs,
      total: timestamps.length,
    };
  }

  /**
   * Express / Node.js middleware handler
   * Returns true if request should continue, false if rate limit error was sent.
   */
  handle(req, res) {
    const ip = this.getClientIp(req);
    const result = this.check(ip);

    if (res.setHeader) {
      res.setHeader('X-RateLimit-Limit', String(this.maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(result.remaining));
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
    }

    if (!result.allowed) {
      const retryAfterSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
      if (res.setHeader) {
        res.setHeader('Retry-After', String(Math.max(1, retryAfterSeconds)));
      }
      if (res.writeHead) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Rate limit exceeded: Maximum 100 requests per IP per hour.',
            retryAfterSeconds: Math.max(1, retryAfterSeconds),
          })
        );
      } else if (res.status && res.json) {
        res.status(429).json({
          error: 'Rate limit exceeded: Maximum 100 requests per IP per hour.',
          retryAfterSeconds: Math.max(1, retryAfterSeconds),
        });
      }
      return false;
    }

    return true;
  }
}

export const rateLimiter = new RateLimiter();
export { RateLimiter };

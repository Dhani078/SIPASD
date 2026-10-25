interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || record.resetTime <= now) {
    return {
      allowed: true,
      remaining: maxAttempts,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  const remaining = Math.max(0, maxAttempts - record.count);
  const resetSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

  return {
    allowed: record.count < maxAttempts,
    remaining,
    resetSeconds,
  };
}

export function recordFailedAttempt(
  key: string,
  windowMs = 15 * 60 * 1000
): { count: number; resetSeconds: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || record.resetTime <= now) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { count: 1, resetSeconds: Math.ceil(windowMs / 1000) };
  }

  record.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
  return { count: record.count, resetSeconds };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

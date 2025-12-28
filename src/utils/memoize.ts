export interface MemoizeOptions {
  maxSize?: number;
  ttl?: number; // Time-to-live in milliseconds
}

export function memoize<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  options: MemoizeOptions = {},
): (...args: Args) => Return {
  const { maxSize = 100, ttl } = options;
  const cache = new Map<string, { value: Return; timestamp: number }>();
  const keyOrder: string[] = [];

  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    // Check if cached value exists and is not expired
    if (cached !== undefined) {
      if (!ttl || now - cached.timestamp < ttl) {
        return cached.value;
      }
      // Expired, remove it
      cache.delete(key);
      const index = keyOrder.indexOf(key);
      if (index > -1) keyOrder.splice(index, 1);
    }

    const result = fn(...args);

    // Evict oldest entries if at capacity
    while (keyOrder.length >= maxSize) {
      const oldestKey = keyOrder.shift();
      if (oldestKey) cache.delete(oldestKey);
    }

    cache.set(key, { value: result, timestamp: now });
    keyOrder.push(key);

    return result;
  };
}

export function memoize<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
): (...args: Args) => Return {
  const cache = new Map<string, Return>();

  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached !== undefined || cache.has(key)) {
      return cached as Return;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

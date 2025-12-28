import { describe, expect, test, mock } from "bun:test";
import { memoize } from "../../../src/utils/memoize";

describe("memoize", () => {
  test("should cache function results", () => {
    const fn = mock((x: number) => x * 2);
    const memoized = memoize(fn);

    expect(memoized(5)).toBe(10);
    expect(memoized(5)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should distinguish between different arguments", () => {
    const fn = mock((x: number) => x * 2);
    const memoized = memoize(fn);

    expect(memoized(5)).toBe(10);
    expect(memoized(10)).toBe(20);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test("should handle multiple arguments", () => {
    const fn = mock((a: number, b: number) => a + b);
    const memoized = memoize(fn);

    expect(memoized(1, 2)).toBe(3);
    expect(memoized(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  describe("cache eviction", () => {
    test("should evict oldest entries when maxSize is reached", () => {
      const fn = mock((x: number) => x * 2);
      const memoized = memoize(fn, { maxSize: 2 });

      memoized(1); // Cache: [1]
      memoized(2); // Cache: [1, 2]
      memoized(3); // Cache: [2, 3] (1 evicted)

      expect(fn).toHaveBeenCalledTimes(3);

      memoized(2); // Should hit cache
      expect(fn).toHaveBeenCalledTimes(3);

      memoized(1); // Should re-compute (was evicted)
      expect(fn).toHaveBeenCalledTimes(4);
    });

    test("should use default maxSize of 100", () => {
      const fn = mock((x: number) => x);
      const memoized = memoize(fn);

      // Fill cache with 100 items
      for (let i = 0; i < 100; i++) {
        memoized(i);
      }
      expect(fn).toHaveBeenCalledTimes(100);

      // All 100 should be cached
      memoized(0);
      memoized(50);
      memoized(99);
      expect(fn).toHaveBeenCalledTimes(100);

      // Adding 101st item should evict first
      memoized(100);
      expect(fn).toHaveBeenCalledTimes(101);

      memoized(0); // Should re-compute (was evicted)
      expect(fn).toHaveBeenCalledTimes(102);
    });

    test("should handle maxSize of 1", () => {
      const fn = mock((x: number) => x * 2);
      const memoized = memoize(fn, { maxSize: 1 });

      memoized(1);
      memoized(1); // Hit cache
      expect(fn).toHaveBeenCalledTimes(1);

      memoized(2); // Evicts 1
      expect(fn).toHaveBeenCalledTimes(2);

      memoized(1); // Re-compute
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe("TTL (time-to-live)", () => {
    test("should expire cached values after TTL", async () => {
      const fn = mock((x: number) => x * 2);
      const memoized = memoize(fn, { ttl: 50 }); // 50ms TTL

      memoized(5);
      expect(fn).toHaveBeenCalledTimes(1);

      // Should hit cache immediately
      memoized(5);
      expect(fn).toHaveBeenCalledTimes(1);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should re-compute after expiration
      memoized(5);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test("should not expire if TTL is not set", async () => {
      const fn = mock((x: number) => x * 2);
      const memoized = memoize(fn); // No TTL

      memoized(5);
      expect(fn).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should still hit cache
      memoized(5);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("should handle multiple values with different expiration times", async () => {
      const fn = mock((x: number) => x * 2);
      const memoized = memoize(fn, { ttl: 50 });

      memoized(1);
      await new Promise((resolve) => setTimeout(resolve, 25));
      memoized(2);

      expect(fn).toHaveBeenCalledTimes(2);

      // Wait for first value to expire
      await new Promise((resolve) => setTimeout(resolve, 30));

      memoized(1); // Should re-compute (expired)
      memoized(2); // Should hit cache (not expired yet)
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe("combined maxSize and TTL", () => {
    test("should handle both eviction and expiration", async () => {
      const fn = mock((x: number) => x * 2);
      const memoized = memoize(fn, { maxSize: 2, ttl: 50 });

      memoized(1);
      memoized(2);
      memoized(3); // Evicts 1

      expect(fn).toHaveBeenCalledTimes(3);

      // 2 and 3 should be cached
      memoized(2);
      memoized(3);
      expect(fn).toHaveBeenCalledTimes(3);

      // Wait for TTL
      await new Promise((resolve) => setTimeout(resolve, 60));

      // All should be expired
      memoized(2);
      memoized(3);
      expect(fn).toHaveBeenCalledTimes(5);
    });
  });
});

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
});

import { describe, expect, test } from "bun:test";
import { sanitizeFormValue } from "../../../src/utils/sanitize";

describe("sanitizeFormValue", () => {
  test("should escape HTML in strings", () => {
    const input = '<script>alert("XSS")</script> <div>Test</div>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; &lt;div&gt;Test&lt;/div&gt;';
    expect(sanitizeFormValue(input)).toBe(expected);
  });

  test("should return non-string values as-is", () => {
    expect(sanitizeFormValue(123)).toBe(123);
    expect(sanitizeFormValue(true)).toBe(true);
    expect(sanitizeFormValue(null)).toBe(null);
    expect(sanitizeFormValue({ a: 1 })).toEqual({ a: 1 });
  });

  test("should handle empty strings", () => {
    expect(sanitizeFormValue("")).toBe("");
  });
});

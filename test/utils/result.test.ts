import { describe, test, expect } from "bun:test";
import { ResultHelpers } from "../../src/utils/result";

describe("Result Module", () => {
  describe("ResultHelpers.ok", () => {
    test("should create successful result with data", () => {
      const result = ResultHelpers.ok("test data");
      expect(result.success).toBe(true);
      expect(result.data).toBe("test data");
      expect(result.message).toBeUndefined();
    });

    test("should create successful result with data and message", () => {
      const result = ResultHelpers.ok("test data", "success message");
      expect(result.success).toBe(true);
      expect(result.data).toBe("test data");
      expect(result.message).toBe("success message");
    });
  });

  describe("ResultHelpers.err", () => {
    test("should create error result", () => {
      const result = ResultHelpers.err("ERROR_CODE", "Error occurred");
      expect(result.success).toBe(false);
      expect(result.error).toBe("ERROR_CODE");
      expect(result.message).toBe("Error occurred");
      expect(result.details).toBeUndefined();
    });

    test("should create error result with details", () => {
      const errorDetails = new Error("Original error");
      const result = ResultHelpers.err("ERROR_CODE", "Error occurred", errorDetails);
      expect(result.success).toBe(false);
      expect(result.error).toBe("ERROR_CODE");
      expect(result.message).toBe("Error occurred");
      expect(result.details).toBe(errorDetails);
    });
  });

  describe("Type Guards", () => {
    test("isOk should correctly identify Ok results", () => {
      const okResult = ResultHelpers.ok("data");
      const errResult = ResultHelpers.err("error", "message");

      expect(ResultHelpers.isOk(okResult)).toBe(true);
      expect(ResultHelpers.isOk(errResult)).toBe(false);
    });

    test("isErr should correctly identify Err results", () => {
      const okResult = ResultHelpers.ok("data");
      const errResult = ResultHelpers.err("error", "message");

      expect(ResultHelpers.isErr(okResult)).toBe(false);
      expect(ResultHelpers.isErr(errResult)).toBe(true);
    });
  });

  describe("Utility Methods", () => {
    describe("map", () => {
      test("should transform Ok result data", () => {
        const result = ResultHelpers.ok(5);
        const mapped = ResultHelpers.map(result, (x) => x * 2);

        expect(ResultHelpers.isOk(mapped)).toBe(true);
        if (ResultHelpers.isOk(mapped)) {
          expect(mapped.data).toBe(10);
        }
      });

      test("should pass through Err result unchanged", () => {
        const result = ResultHelpers.err("ERROR", "Something went wrong");
        const mapped = ResultHelpers.map(result, (x: any) => x * 2);

        expect(ResultHelpers.isErr(mapped)).toBe(true);
        expect(mapped).toBe(result);
      });
    });

    describe("flatMap", () => {
      test("should chain Ok results", () => {
        const result = ResultHelpers.ok(5);
        const flatMapped = ResultHelpers.flatMap(result, (x) =>
          ResultHelpers.ok(x.toString())
        );

        expect(ResultHelpers.isOk(flatMapped)).toBe(true);
        if (ResultHelpers.isOk(flatMapped)) {
          expect(flatMapped.data).toBe("5");
        }
      });

      test("should return Err when flatMap function returns Err", () => {
        const result = ResultHelpers.ok(5);
        const flatMapped = ResultHelpers.flatMap(result, () =>
          ResultHelpers.err("TRANSFORM_ERROR", "Transform failed")
        );

        expect(ResultHelpers.isErr(flatMapped)).toBe(true);
        if (ResultHelpers.isErr(flatMapped)) {
          expect(flatMapped.error).toBe("TRANSFORM_ERROR");
        }
      });

      test("should pass through Err result", () => {
        const result = ResultHelpers.err("ERROR", "Original error");
        const flatMapped = ResultHelpers.flatMap(result, (x: any) =>
          ResultHelpers.ok(x.toString())
        );

        expect(flatMapped).toBe(result);
      });
    });

    describe("unwrapOr", () => {
      test("should return data for Ok result", () => {
        const result = ResultHelpers.ok("success");
        const value = ResultHelpers.unwrapOr(result, "default");
        expect(value).toBe("success");
      });

      test("should return default value for Err result", () => {
        const result = ResultHelpers.err("ERROR", "Failed");
        const value = ResultHelpers.unwrapOr(result, "default");
        expect(value).toBe("default");
      });
    });

    describe("unwrapOrThrow", () => {
      test("should return data for Ok result", () => {
        const result = ResultHelpers.ok("success");
        const value = ResultHelpers.unwrapOrThrow(result);
        expect(value).toBe("success");
      });

      test("should throw details error when available", () => {
        const errorDetails = new Error("Detailed error");
        const result = ResultHelpers.err("ERROR", "Failed", errorDetails);

        expect(() => ResultHelpers.unwrapOrThrow(result)).toThrow("Detailed error");
      });

      test("should throw generic error when no details", () => {
        const result = ResultHelpers.err("ERROR", "Failed");

        expect(() => ResultHelpers.unwrapOrThrow(result)).toThrow("Failed");
      });
    });
  });

  describe("Complex scenarios", () => {
    test("should handle chaining operations", () => {
      const result = ResultHelpers.ok(10)
      const final = ResultHelpers.flatMap(
        ResultHelpers.map(result, x => x * 2), // 20
        x => x > 15 ? ResultHelpers.ok(`Large: ${x}`) : ResultHelpers.err("TOO_SMALL", "Value too small")
      );

      expect(ResultHelpers.isOk(final)).toBe(true);
      if (ResultHelpers.isOk(final)) {
        expect(final.data).toBe("Large: 20");
      }
    });
  });
});

import { describe, expect, test } from "bun:test";
import { ErrorCode, FormError, SchemaError } from "../../../src/schema/error";

describe("SchemaError", () => {
  test("should include error code and message", () => {
    const error = new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      message: "Test error message",
    });

    expect(error.code).toBe(ErrorCode.SCHEMA_VALIDATION_ERROR);
    expect(error.message).toBe("Test error message");
  });

  test("should include path if provided", () => {
    const error = new SchemaError(ErrorCode.FILE_MISSING_SCHEMA, {
      message: "Missing",
      path: "path/to/file.md",
    });

    expect(error.path).toBe("path/to/file.md");
  });

  test("should include details if provided", () => {
    const details = { field: "test" };
    const error = new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      message: "Error",
      details,
    });

    expect(error.details).toEqual(details);
  });
});

describe("FormError", () => {
  test("should include message", () => {
    const error = new FormError("Test form error");
    expect(error.message).toBe("Test form error");
  });

  test("should include cause if provided", () => {
    const cause = new Error("Original error");
    const error = new FormError("Form error", cause);
    expect(error.cause).toBe(cause);
  });
});

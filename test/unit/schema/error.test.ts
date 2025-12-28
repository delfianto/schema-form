import { describe, expect, test } from "bun:test";
import { ErrorCode, FormError, SchemaError, YamlParseError, ValidationError } from "../../../src/schema/error";

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

describe("YamlParseError", () => {
  test("should create with default message", () => {
    const error = new YamlParseError();
    expect(error.code).toBe(ErrorCode.SCHEMA_YAML_ERROR);
    expect(error.name).toBe("YamlParseError");
    expect(error).toBeInstanceOf(YamlParseError);
    expect(error).toBeInstanceOf(SchemaError);
  });

  test("should create with custom message", () => {
    const error = new YamlParseError({ message: "Custom YAML error" });
    expect(error.message).toBe("Custom YAML error");
    expect(error.code).toBe(ErrorCode.SCHEMA_YAML_ERROR);
  });

  test("should include path if provided", () => {
    const error = new YamlParseError({ path: "schemas/test.md", message: "Parse failed" });
    expect(error.path).toBe("schemas/test.md");
    expect(error.message).toBe("Parse failed");
  });

  test("should include cause if provided", () => {
    const cause = new Error("Original YAML error");
    const error = new YamlParseError({ message: "YAML parse failed", cause });
    expect(error.cause).toBe(cause);
  });
});

describe("ValidationError", () => {
  test("should create with default message", () => {
    const error = new ValidationError();
    expect(error.code).toBe(ErrorCode.SCHEMA_VALIDATION_ERROR);
    expect(error.name).toBe("ValidationError");
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toBeInstanceOf(SchemaError);
  });

  test("should include field and value in details", () => {
    const error = new ValidationError({
      field: "email",
      value: "invalid",
      message: "Invalid email",
    });
    expect(error.details?.["field"]).toBe("email");
    expect(error.details?.["value"]).toBe("invalid");
    expect(error.message).toBe("Invalid email");
  });

  test("should include path if provided", () => {
    const error = new ValidationError({
      path: "schemas/form.md",
      field: "username",
      message: "Validation failed",
    });
    expect(error.path).toBe("schemas/form.md");
    expect(error.details?.["field"]).toBe("username");
  });

  test("should include cause if provided", () => {
    const cause = new Error("Original validation error");
    const error = new ValidationError({ message: "Validation failed", cause });
    expect(error.cause).toBe(cause);
  });

  test("should handle undefined field and value", () => {
    const error = new ValidationError({ message: "General validation error" });
    expect(error.details?.["field"]).toBeUndefined();
    expect(error.details?.["value"]).toBeUndefined();
    expect(error.message).toBe("General validation error");
  });
});

import { describe, expect, test } from "bun:test";
import { TextFieldRenderer } from "../../../../src/form/renderers/TextFieldRenderer";

describe("TextFieldRenderer", () => {
  const renderer = new TextFieldRenderer();

  describe("supports", () => {
    test("should support TEXT type", () => {
      expect(renderer.supports("TEXT")).toBe(true);
    });

    test("should not support other types", () => {
      expect(renderer.supports("NUMBER")).toBe(false);
      expect(renderer.supports("DATE")).toBe(false);
      expect(renderer.supports("SELECT")).toBe(false);
      expect(renderer.supports("TOGGLE")).toBe(false);
    });
  });

  describe("getValidator", () => {
    test("should validate required field", () => {
      const validator = renderer.getValidator({
        name: "test",
        type: "TEXT",
        required: true,
      });

      expect(validator("")).toContain("This field is required");
      expect(validator("value")).toEqual([]);
    });

    test("should allow empty value for optional field", () => {
      const validator = renderer.getValidator({
        name: "test",
        type: "TEXT",
        required: false,
      });

      expect(validator("")).toEqual([]);
      expect(validator(null)).toEqual([]);
      expect(validator(undefined)).toEqual([]);
    });

    test("should validate minLength", () => {
      const validator = renderer.getValidator({
        name: "test",
        type: "TEXT",
        required: true,
        minLength: 5,
      });

      expect(validator("abc")).toContain("Minimum length is 5 characters");
      expect(validator("abcde")).toEqual([]);
      expect(validator("abcdef")).toEqual([]);
    });

    test("should validate maxLength", () => {
      const validator = renderer.getValidator({
        name: "test",
        type: "TEXT",
        required: true,
        maxLength: 10,
      });

      expect(validator("12345678901")).toContain("Maximum length is 10 characters");
      expect(validator("1234567890")).toEqual([]);
      expect(validator("123")).toEqual([]);
    });

    test("should validate regex pattern", () => {
      const validator = renderer.getValidator({
        name: "email",
        type: "TEXT",
        required: true,
        regex: "^[^@]+@[^@]+\\.[^@]+$",
      });

      expect(validator("invalid")).toContain("Invalid format");
      expect(validator("test@example.com")).toEqual([]);
    });

    test("should handle invalid regex gracefully", () => {
      const validator = renderer.getValidator({
        name: "test",
        type: "TEXT",
        required: false,
        regex: "[invalid",
      });

      // Should still create a validator, just without the regex validation
      expect(validator("anything")).toEqual([]);
    });

    test("should combine multiple validations", () => {
      const validator = renderer.getValidator({
        name: "username",
        type: "TEXT",
        required: true,
        minLength: 3,
        maxLength: 20,
      });

      expect(validator("")).toContain("This field is required");
      expect(validator("ab")).toContain("Minimum length is 3 characters");
      expect(validator("123456789012345678901")).toContain("Maximum length is 20 characters");
      expect(validator("validuser")).toEqual([]);
    });
  });
});

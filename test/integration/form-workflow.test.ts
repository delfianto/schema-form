import { describe, expect, test, beforeEach } from "bun:test";
import { FormState } from "../../src/form/FormState";
import { defaultRegistry } from "../../src/form/RendererRegistry";
import { TextFieldRenderer } from "../../src/form/renderers";

describe("Form Workflow Integration", () => {
  beforeEach(() => {
    defaultRegistry.clear();
    defaultRegistry.register(new TextFieldRenderer());
  });

  test("should validate required fields before submission", () => {
    const state = new FormState();

    // Simulate validation without UI
    state.addValidator("username", (value) =>
      value ? [] : ["Username is required"],
    );

    const result = state.validateAll();
    expect(result.isValid).toBe(false);
    expect(result.errors["username"]).toContain("Username is required");
  });

  test("should pass validation with valid data", () => {
    const state = new FormState();
    state.setValue("username", "testuser");
    state.addValidator("username", (value) =>
      value ? [] : ["Username is required"],
    );

    const result = state.validateAll();
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test("should handle multi-field validation workflow", () => {
    const state = new FormState();

    // Add validators for multiple fields
    state.addValidator("username", (value) =>
      value ? [] : ["Username is required"],
    );
    state.addValidator("email", (value) => {
      if (!value) return ["Email is required"];
      if (typeof value === "string" && !value.includes("@")) {
        return ["Invalid email format"];
      }
      return [];
    });

    // Initially should fail validation
    let result = state.validateAll();
    expect(result.isValid).toBe(false);
    expect(result.errors["username"]).toBeDefined();
    expect(result.errors["email"]).toBeDefined();

    // Set valid username, should still fail on email
    state.setValue("username", "testuser");
    result = state.validateAll();
    expect(result.isValid).toBe(false);
    expect(result.errors["username"]).toBeUndefined();
    expect(result.errors["email"]).toBeDefined();

    // Set valid email, should pass
    state.setValue("email", "test@example.com");
    result = state.validateAll();
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });
});

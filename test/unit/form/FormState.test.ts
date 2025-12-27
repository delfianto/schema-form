import { beforeEach, describe, expect, mock, test } from "bun:test";
import { FormState } from "../../../src/form/FormState";

describe("FormState", () => {
	let state: FormState;

	beforeEach(() => {
		state = new FormState();
	});

	describe("constructor", () => {
		test("should create empty state by default", () => {
			const emptyState = new FormState();
			expect(emptyState.getValue("any")).toBeUndefined();
		});

		test("should initialize with provided data", () => {
			const initData = { name: "John", age: 30 };
			const initializedState = new FormState(initData);

			expect(initializedState.getValue("name")).toBe("John");
			expect(initializedState.getValue("age")).toBe(30);
		});

		test("should create a copy of init data (not reference)", () => {
			const initData = { name: "John" };
			const initializedState = new FormState(initData);

			initData.name = "Jane";

			expect(initializedState.getValue("name")).toBe("John");
		});
	});

	describe("getValue / setValue", () => {
		test("should get undefined for non-existent field", () => {
			expect(state.getValue("nonexistent")).toBeUndefined();
		});

		test("should set and get string values", () => {
			state.setValue("name", "Alice");
			expect(state.getValue("name")).toBe("Alice");
		});

		test("should set and get number values", () => {
			state.setValue("age", 25);
			expect(state.getValue("age")).toBe(25);
		});

		test("should set and get boolean values", () => {
			state.setValue("active", true);
			expect(state.getValue("active")).toBe(true);
		});

		test("should set and get null values", () => {
			state.setValue("optional", null);
			expect(state.getValue("optional")).toBeNull();
		});

		test("should set and get array values", () => {
			const tags = ["tag1", "tag2"];
			state.setValue("tags", tags);
			expect(state.getValue("tags")).toEqual(tags);
		});

		test("should set and get object values", () => {
			const obj = { nested: { value: 123 } };
			state.setValue("config", obj);
			expect(state.getValue("config")).toEqual(obj);
		});

		test("should overwrite existing values", () => {
			state.setValue("field", "old");
			state.setValue("field", "new");
			expect(state.getValue("field")).toBe("new");
		});

		test("should handle rapid successive updates", () => {
			state.setValue("counter", 0);
			state.setValue("counter", 1);
			state.setValue("counter", 2);
			state.setValue("counter", 3);
			expect(state.getValue("counter")).toBe(3);
		});

		test("should sanitize string values to prevent XSS", () => {
			const unsafe = '<script>alert("xss")</script><div>Safe</div>';
			const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&lt;div&gt;Safe&lt;/div&gt;';
			state.setValue("input", unsafe);
			expect(state.getValue("input")).toBe(expected);
		});
	});

	describe("getLabel / setLabel", () => {
		test("should get undefined label for non-existent field", () => {
			expect(state.getLabel("nonexistent")).toBeUndefined();
		});

		test("should set and get label", () => {
			state.setLabel("email", "Email Address");
			expect(state.getLabel("email")).toBe("Email Address");
		});

		test("should allow overwriting labels", () => {
			state.setLabel("field", "Old Label");
			state.setLabel("field", "New Label");
			expect(state.getLabel("field")).toBe("New Label");
		});

		test("should store labels independently from values", () => {
			state.setValue("field", "value");
			state.setLabel("field", "label");

			expect(state.getValue("field")).toBe("value");
			expect(state.getLabel("field")).toBe("label");
		});
	});

	describe("getAllData", () => {
		test("should return data and label objects", () => {
			state.setValue("name", "John");
			state.setLabel("name", "Full Name");

			const all = state.getAllData();

			expect(all).toHaveProperty("data");
			expect(all).toHaveProperty("label");
			expect(all["data"]).toEqual({ name: "John" });
			expect(all["label"]).toEqual({ name: "Full Name" });
		});

		test("should return empty objects when no data set", () => {
			const all = state.getAllData();

			expect(all["data"]).toEqual({});
			expect(all["label"]).toEqual({});
		});

		test("should include all set values and labels", () => {
			state.setValue("field1", "value1");
			state.setValue("field2", "value2");
			state.setLabel("field1", "Label 1");
			state.setLabel("field2", "Label 2");

			const all = state.getAllData();

			expect(all["data"]).toEqual({ field1: "value1", field2: "value2" });
			expect(all["label"]).toEqual({ field1: "Label 1", field2: "Label 2" });
		});
	});

	describe("setDefaults", () => {
		test("should set default values for undefined fields", () => {
			state.setDefaults({ name: "Default Name", age: 18 });

			expect(state.getValue("name")).toBe("Default Name");
			expect(state.getValue("age")).toBe(18);
		});

		test("should not overwrite existing values", () => {
			state.setValue("name", "Existing Name");
			state.setDefaults({ name: "Default Name", age: 18 });

			expect(state.getValue("name")).toBe("Existing Name");
			expect(state.getValue("age")).toBe(18);
		});

		test("should handle empty defaults object", () => {
			state.setValue("name", "John");
			state.setDefaults({});

			expect(state.getValue("name")).toBe("John");
		});

		test("should handle null and undefined default values", () => {
			state.setDefaults({ nullField: null, undefinedField: undefined });

			expect(state.getValue("nullField")).toBeNull();
			expect(state.getValue("undefinedField")).toBeUndefined();
		});

		test("should work with constructor-initialized data", () => {
			const initState = new FormState({ existing: "value" });
			initState.setDefaults({ existing: "default", new: "default" });

			expect(initState.getValue("existing")).toBe("value");
			expect(initState.getValue("new")).toBe("default");
		});
	});

	describe("addValidator / validateField", () => {
		test("should return empty array when no validator exists", () => {
			const errors = state.validateField("field");
			expect(errors).toEqual([]);
		});

		test("should validate field with custom validator", () => {
			const validator = (value: unknown) => {
				return typeof value === "string" && value.length > 0 ? [] : ["Field is required"];
			};

			state.addValidator("name", validator);
			const errors = state.validateField("name");

			expect(errors).toEqual(["Field is required"]);
		});

		test("should validate successfully when value passes", () => {
			const validator = (value: unknown) => {
				return typeof value === "string" && value.length > 0 ? [] : ["Field is required"];
			};

			state.addValidator("name", validator);
			state.setValue("name", "John");

			const errors = state.validateField("name");
			expect(errors).toEqual([]);
		});

		test("should return multiple validation errors", () => {
			const validator = (value: unknown) => {
				const errors: string[] = [];
				if (typeof value !== "string") errors.push("Must be a string");
				if (!value || (value as string).length < 3) errors.push("Must be at least 3 characters");
				if ((value as string).length > 50) errors.push("Must be at most 50 characters");
				return errors;
			};

			state.addValidator("field", validator);
			state.setValue("field", "ab");

			const errors = state.validateField("field");
			expect(errors).toContain("Must be at least 3 characters");
		});

		test("should validate number fields", () => {
			const validator = (value: unknown) => {
				const num = Number(value);
				if (Number.isNaN(num)) return ["Must be a number"];
				if (num < 0) return ["Must be positive"];
				if (num > 100) return ["Must be at most 100"];
				return [];
			};

			state.addValidator("age", validator);
			state.setValue("age", 150);

			const errors = state.validateField("age");
			expect(errors).toContain("Must be at most 100");
		});

		test("should overwrite existing validator", () => {
			const validator1 = () => ["Error 1"];
			const validator2 = () => ["Error 2"];

			state.addValidator("field", validator1);
			expect(state.validateField("field")).toEqual(["Error 1"]);

			state.addValidator("field", validator2);
			expect(state.validateField("field")).toEqual(["Error 2"]);
		});
	});

	describe("validateAll", () => {
		test("should return valid when no validators", () => {
			const result = state.validateAll();

			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual({});
		});

		test("should validate all fields with validators", () => {
			state.addValidator("name", (value) =>
				typeof value === "string" && value.length > 0 ? [] : ["Name is required"]
			);
			state.addValidator("age", (value) => (typeof value === "number" && value > 0 ? [] : ["Age must be positive"]));

			const result = state.validateAll();

			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveProperty("name");
			expect(result.errors).toHaveProperty("age");
		});

		test("should return valid when all validators pass", () => {
			state.setValue("name", "John");
			state.setValue("age", 30);

			state.addValidator("name", (value) => (typeof value === "string" && value.length > 0 ? [] : ["Name is required"]));
			state.addValidator("age", (value) => (typeof value === "number" && value > 0 ? [] : ["Age must be positive"]));

			const result = state.validateAll();

			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual({});
		});

		test("should collect errors from multiple fields", () => {
			state.addValidator("field1", () => ["Error 1"]);
			state.addValidator("field2", () => ["Error 2a", "Error 2b"]);
			state.addValidator("field3", () => []);

			const result = state.validateAll();

			expect(result.isValid).toBe(false);
			expect(result.errors["field1"]).toEqual(["Error 1"]);
			expect(result.errors["field2"]).toEqual(["Error 2a", "Error 2b"]);
			expect(result.errors["field3"]).toBeUndefined();
		});

		test("should not include fields with no errors", () => {
			state.addValidator("valid", () => []);
			state.addValidator("invalid", () => ["Error"]);

			const result = state.validateAll();

			expect(result.errors).not.toHaveProperty("valid");
			expect(result.errors).toHaveProperty("invalid");
		});
	});

	describe("onFieldChange", () => {
		test("should call listener when field value changes", () => {
			const listener = mock(() => {});

			state.onFieldChange("name", listener);
			state.setValue("name", "John");

			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith("John");
		});

		test("should not call listener when setting same value", () => {
			const listener = mock(() => {});

			state.setValue("name", "John");
			state.onFieldChange("name", listener);
			state.setValue("name", "John");

			expect(listener).not.toHaveBeenCalled();
		});

		test("should call listener multiple times for different changes", () => {
			const listener = mock(() => {});

			state.onFieldChange("counter", listener);
			state.setValue("counter", 1);
			state.setValue("counter", 2);
			state.setValue("counter", 3);

			expect(listener).toHaveBeenCalledTimes(3);
		});

		test("should support multiple listeners for same field", () => {
			const listener1 = mock(() => {});
			const listener2 = mock(() => {});

			state.onFieldChange("field", listener1);
			state.onFieldChange("field", listener2);
			state.setValue("field", "value");

			expect(listener1).toHaveBeenCalledWith("value");
			expect(listener2).toHaveBeenCalledWith("value");
		});

		test("should only call listeners for changed field", () => {
			const listener1 = mock(() => {});
			const listener2 = mock(() => {});

			state.onFieldChange("field1", listener1);
			state.onFieldChange("field2", listener2);
			state.setValue("field1", "value");

			expect(listener1).toHaveBeenCalled();
			expect(listener2).not.toHaveBeenCalled();
		});

		test("should handle listener errors gracefully", () => {
			const failingListener = mock(() => {
				throw new Error("Listener error");
			});
			const successListener = mock(() => {});

			state.onFieldChange("field", failingListener);
			state.onFieldChange("field", successListener);

			expect(() => state.setValue("field", "value")).toThrow();
		});

		test("should not call listener when field is set before registration", () => {
			const listener = mock(() => {});

			state.setValue("field", "value");
			state.onFieldChange("field", listener);

			expect(listener).not.toHaveBeenCalled();
		});

		test("should handle null listener gracefully", () => {
			expect(() => {
				state.onFieldChange("field", null as any);
				state.setValue("field", "value");
			}).not.toThrow();
		});
	});

	describe("onValidationChange", () => {
		test("should call validation listener when any field changes", () => {
			const listener = mock(() => {});

			state.onValidationChange(listener);
			state.setValue("field", "value");

			expect(listener).toHaveBeenCalledTimes(1);
		});

		test("should not call listener when setting same value", () => {
			const listener = mock(() => {});

			state.setValue("field", "value");
			state.onValidationChange(listener);
			state.setValue("field", "value");

			expect(listener).not.toHaveBeenCalled();
		});

		test("should call listener for any field change", () => {
			const listener = mock(() => {});

			state.onValidationChange(listener);
			state.setValue("field1", "value1");
			state.setValue("field2", "value2");

			expect(listener).toHaveBeenCalledTimes(2);
		});

		test("should support multiple validation listeners", () => {
			const listener1 = mock(() => {});
			const listener2 = mock(() => {});

			state.onValidationChange(listener1);
			state.onValidationChange(listener2);
			state.setValue("field", "value");

			expect(listener1).toHaveBeenCalled();
			expect(listener2).toHaveBeenCalled();
		});

		test("should call both field and validation listeners", () => {
			const fieldListener = mock(() => {});
			const validationListener = mock(() => {});

			state.onFieldChange("field", fieldListener);
			state.onValidationChange(validationListener);
			state.setValue("field", "value");

			expect(fieldListener).toHaveBeenCalledWith("value");
			expect(validationListener).toHaveBeenCalled();
		});
	});

	describe("onErrorChange", () => {
		test("should call error listener when field validation changes", () => {
			const listener = mock((_errors: string[]) => {});
			const validator = (value: unknown) => (value === "invalid" ? ["Invalid value"] : []);

			state.addValidator("field", validator);
			state.onErrorChange("field", listener);

			state.setValue("field", "invalid");

			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith(["Invalid value"]);

			state.setValue("field", "valid");
			expect(listener).toHaveBeenCalledTimes(2);
			expect(listener).toHaveBeenCalledWith([]);
		});

		test("should not call error listener when field value is same", () => {
			const listener = mock((_errors: string[]) => {});
			const validator = (value: unknown) => (value === "invalid" ? ["Invalid value"] : []);

			state.addValidator("field", validator);
			state.setValue("field", "invalid");
			state.onErrorChange("field", listener);

			state.setValue("field", "invalid");
			expect(listener).not.toHaveBeenCalled();
		});
	});

	describe("complex scenarios", () => {
		test("should handle form workflow: init -> validate -> update -> validate", () => {
			state.setValue("name", "");
			state.setValue("email", "");

			state.addValidator("name", (value) => (value ? [] : ["Name is required"]));
			state.addValidator("email", (value) =>
				typeof value === "string" && value.includes("@") ? [] : ["Invalid email"]
			);

			let result = state.validateAll();
			expect(result.isValid).toBe(false);

			state.setValue("name", "John");
			state.setValue("email", "john@example.com");

			result = state.validateAll();
			expect(result.isValid).toBe(true);
		});

		test("should maintain independent state for multiple instances", () => {
			const state1 = new FormState();
			const state2 = new FormState();

			state1.setValue("field", "value1");
			state2.setValue("field", "value2");

			expect(state1.getValue("field")).toBe("value1");
			expect(state2.getValue("field")).toBe("value2");
		});

		test("should handle complex nested object values", () => {
			const complexValue = {
				user: {
					name: "John",
					contacts: {
						email: "john@example.com",
						phones: ["123", "456"],
					},
				},
			};

			state.setValue("profile", complexValue);
			const retrieved = state.getValue("profile") as typeof complexValue;

			expect(retrieved.user.name).toBe("John");
			expect(retrieved.user.contacts.phones).toHaveLength(2);
		});

		test("should handle reactive form updates with listeners", () => {
			const updates: string[] = [];

			state.onFieldChange("field", (value) => {
				updates.push(`field: ${value}`);
			});

			state.onValidationChange(() => {
				updates.push("validation");
			});

			state.setValue("field", "value1");
			state.setValue("field", "value2");

			expect(updates).toEqual(["field: value1", "validation", "field: value2", "validation"]);
		});
	});
});

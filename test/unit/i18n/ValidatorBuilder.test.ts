import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { ValidatorBuilder } from "../../../src/form/validation/ValidatorBuilder";

describe("ValidatorBuilder i18n", () => {
	test("should use English error messages by default", () => {
		const validator = new ValidatorBuilder().required().build();

		const errors = validator("");
		expect(errors).toContain("This field is required");
	});

	test("should use Indonesian error messages", () => {
		const validator = new ValidatorBuilder(z.string(), "id").required().build();

		const errors = validator("");
		expect(errors).toContain("Bidang ini wajib diisi");
	});

	test("should use Japanese error messages", () => {
		const validator = new ValidatorBuilder(z.string(), "ja").required().build();

		const errors = validator("");
		expect(errors).toContain("この項目は必須です");
	});

	test("should use Chinese error messages for minLength", () => {
		const validator = new ValidatorBuilder(z.string(), "zh")
			.required()
			.minLength(5)
			.build();

		const errors = validator("abc");
		expect(errors.some((e) => e.includes("5个字符"))).toBe(true);
	});

	test("should use Indonesian error messages for maxLength", () => {
		const validator = new ValidatorBuilder(z.string(), "id")
			.required()
			.maxLength(10)
			.build();

		const errors = validator("12345678901");
		expect(errors.some((e) => e.includes("10 karakter"))).toBe(true);
	});

	test("should use Spanish error messages for pattern", () => {
		const validator = new ValidatorBuilder(z.string(), "es")
			.required()
			.pattern(/^\d+$/)
			.build();

		const errors = validator("abc");
		expect(errors.some((e) => e.includes("inválido"))).toBe(true);
	});

	test("should allow custom error messages to override locale", () => {
		const validator = new ValidatorBuilder(z.string(), "id")
			.required("Custom required message")
			.build();

		const errors = validator("");
		expect(errors).toContain("Custom required message");
	});

	test("should use localized messages for number validators", () => {
		const validator = new ValidatorBuilder(z.number(), "fr")
			.minValue(10)
			.maxValue(100)
			.build();

		const errorsMin = validator(5);
		expect(errorsMin.some((e) => e.includes("10"))).toBe(true);

		const errorsMax = validator(150);
		expect(errorsMax.some((e) => e.includes("100"))).toBe(true);
	});
});

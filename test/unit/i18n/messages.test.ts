import { describe, expect, test } from "bun:test";
import { getErrorMessages } from "../../../src/i18n/messages";

describe("Error Messages i18n", () => {
	test("should return English messages by default", () => {
		const messages = getErrorMessages("en");

		expect(messages.required).toBe("This field is required");
		expect(messages.invalidEmail).toBe("Please enter a valid email address");
		expect(messages.pattern).toBe("Invalid format");
	});

	test("should return Indonesian messages", () => {
		const messages = getErrorMessages("id");

		expect(messages.required).toBe("Bidang ini wajib diisi");
		expect(messages.invalidEmail).toBe("Masukkan alamat email yang valid");
		expect(messages.pattern).toBe("Format tidak valid");
	});

	test("should return Japanese messages", () => {
		const messages = getErrorMessages("ja");

		expect(messages.required).toBe("この項目は必須です");
		expect(messages.invalidEmail).toBe("有効なメールアドレスを入力してください");
		expect(messages.pattern).toBe("無効な形式");
	});

	test("should return Chinese (Simplified) messages", () => {
		const messages = getErrorMessages("zh");

		expect(messages.required).toBe("此字段为必填项");
		expect(messages.invalidEmail).toBe("请输入有效的电子邮件地址");
		expect(messages.pattern).toBe("格式无效");
	});

	test("should return parameterized messages", () => {
		const messages = getErrorMessages("en");

		expect(messages.minLength(5)).toBe("Minimum length is 5 characters");
		expect(messages.maxLength(100)).toBe("Maximum length is 100 characters");
		expect(messages.minValue(10)).toBe("Minimum value is 10");
		expect(messages.maxValue(100)).toBe("Maximum value is 100");
	});

	test("should return parameterized messages in Indonesian", () => {
		const messages = getErrorMessages("id");

		expect(messages.minLength(5)).toBe("Panjang minimum adalah 5 karakter");
		expect(messages.maxLength(100)).toBe("Panjang maksimum adalah 100 karakter");
		expect(messages.minValue(10)).toBe("Nilai minimum adalah 10");
		expect(messages.maxValue(100)).toBe("Nilai maksimum adalah 100");
	});
});

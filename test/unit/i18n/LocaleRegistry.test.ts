import { describe, expect, test } from "bun:test";
import { LocaleRegistry } from "../../../src/i18n/LocaleRegistry";

describe("LocaleRegistry", () => {
	test("should get locale config by code", () => {
		const enConfig = LocaleRegistry.get("en");

		expect(enConfig).toBeDefined();
		expect(enConfig?.code).toBe("en");
		expect(enConfig?.name).toBe("English");
		expect(enConfig?.nativeName).toBe("English");
		expect(enConfig?.dateFormat).toBe("YYYY-MM-DD");
	});

	test("should get Indonesian locale config", () => {
		const idConfig = LocaleRegistry.get("id");

		expect(idConfig).toBeDefined();
		expect(idConfig?.code).toBe("id");
		expect(idConfig?.name).toBe("Indonesian");
		expect(idConfig?.nativeName).toBe("Bahasa Indonesia");
		expect(idConfig?.dateFormat).toBe("DD/MM/YYYY");
	});

	test("should get all locale configs", () => {
		const allConfigs = LocaleRegistry.getAll();

		expect(allConfigs.length).toBeGreaterThanOrEqual(10);
		expect(allConfigs.some((c) => c.code === "en")).toBe(true);
		expect(allConfigs.some((c) => c.code === "id")).toBe(true);
		expect(allConfigs.some((c) => c.code === "ja")).toBe(true);
		expect(allConfigs.some((c) => c.code === "zh")).toBe(true);
	});

	test("should get all supported locale codes", () => {
		const codes = LocaleRegistry.getSupportedCodes();

		expect(codes.length).toBeGreaterThanOrEqual(10);
		expect(codes).toContain("en");
		expect(codes).toContain("id");
		expect(codes).toContain("ja");
		expect(codes).toContain("zh");
		expect(codes).toContain("ko");
		expect(codes).toContain("es");
		expect(codes).toContain("fr");
		expect(codes).toContain("de");
		expect(codes).toContain("pt-BR");
	});

	test("should return undefined for unknown locale", () => {
		const unknownConfig = LocaleRegistry.get("xx" as any);

		expect(unknownConfig).toBeUndefined();
	});

	test("should allow registering new locale", () => {
		LocaleRegistry.register({
			code: "ko",
			name: "Korean",
			nativeName: "한국어",
			dateFormat: "YYYY년 MM월 DD일",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 0,
			},
		});

		const koConfig = LocaleRegistry.get("ko");
		expect(koConfig).toBeDefined();
		expect(koConfig?.nativeName).toBe("한국어");
	});
});

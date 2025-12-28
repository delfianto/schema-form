import type { LocaleConfig, SupportedLocale } from "./types";

const configs = new Map<SupportedLocale, LocaleConfig>([
  [
    "en",
    {
      code: "en",
      name: "English",
      nativeName: "English",
      dateFormat: "YYYY-MM-DD",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
  [
    "id",
    {
      code: "id",
      name: "Indonesian",
      nativeName: "Bahasa Indonesia",
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
  [
    "ja",
    {
      code: "ja",
      name: "Japanese",
      nativeName: "日本語",
      dateFormat: "YYYY年MM月DD日",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
  [
    "zh",
    {
      code: "zh",
      name: "Chinese (Simplified)",
      nativeName: "简体中文",
      dateFormat: "YYYY年MM月DD日",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
  [
    "zh-TW",
    {
      code: "zh-TW",
      name: "Chinese (Traditional)",
      nativeName: "繁體中文",
      dateFormat: "YYYY年MM月DD日",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
  [
    "ko",
    {
      code: "ko",
      name: "Korean",
      nativeName: "한국어",
      dateFormat: "YYYY년 MM월 DD일",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
  [
    "es",
    {
      code: "es",
      name: "Spanish",
      nativeName: "Español",
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
  [
    "fr",
    {
      code: "fr",
      name: "French",
      nativeName: "Français",
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
  [
    "de",
    {
      code: "de",
      name: "German",
      nativeName: "Deutsch",
      dateFormat: "DD.MM.YYYY",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
  [
    "pt-BR",
    {
      code: "pt-BR",
      name: "Portuguese (Brazil)",
      nativeName: "Português (Brasil)",
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        style: "decimal",
        minimumFractionDigits: 0,
      },
    },
  ],
]);

export function get(locale: SupportedLocale): LocaleConfig | undefined {
  return configs.get(locale);
}

export function getAll(): LocaleConfig[] {
  return Array.from(configs.values());
}

export function getSupportedCodes(): SupportedLocale[] {
  return Array.from(configs.keys());
}

export function register(config: LocaleConfig): void {
  configs.set(config.code, config);
}

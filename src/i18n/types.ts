import type { Schema } from "../schema/definitions";

/**
 * Supported locale codes
 */
export type SupportedLocale =
  | "en"
  | "id"
  | "ja"
  | "zh"
  | "zh-TW"
  | "ko"
  | "es"
  | "fr"
  | "de"
  | "pt-BR";

/**
 * Locale configuration
 */
export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}

/**
 * Schema resolution result
 */
export interface SchemaResolution {
  schema: Schema;
  locale: SupportedLocale;
  fallback: boolean; // true if fallback locale was used
  path: string; // actual file path used
}

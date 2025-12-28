import type { SupportedLocale } from "../i18n/types";
import type SchemaFormPlugin from "../main";

export interface SchemaFormSettings {
  schemaDir: string;
  debugFlag: boolean;
  locale: SupportedLocale;
  autoDetectLocale: boolean;
}

export const DEFAULT_SETTINGS: SchemaFormSettings = {
  schemaDir: "",
  debugFlag: false,
  locale: "en",
  autoDetectLocale: true,
};

export async function load(plugin: SchemaFormPlugin): Promise<SchemaFormSettings> {
  return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}

export async function save(plugin: SchemaFormPlugin): Promise<void> {
  await plugin.saveData(plugin.settings);
}

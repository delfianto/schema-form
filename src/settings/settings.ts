import type SchemaFormPlugin from "../main";

const DEFAULT_SETTINGS: SchemaFormSettings = {
  schemaDir: "",
  debugFlag: false,
};

export interface SchemaFormSettings {
  schemaDir: string;
  debugFlag: boolean;
}

export async function load(plugin: SchemaFormPlugin): Promise<SchemaFormSettings> {
  return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}

export async function save(plugin: SchemaFormPlugin): Promise<void> {
  await plugin.saveData(plugin.settings);
}

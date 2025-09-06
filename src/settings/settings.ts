import type { Plugin } from "obsidian";
import type SchemaFormPlugin from "../main";

const DEFAULT_SETTINGS: SchemaFormSettings = {
  schemaDir: "",
  debugFlag: true,
};

export interface SchemaFormSettings {
  schemaDir: string;
  debugFlag: boolean;
}

export async function load(plugin: Plugin): Promise<SchemaFormSettings> {
  return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}

export async function save(plugin: SchemaFormPlugin) {
  await plugin.saveData(plugin.settings);
}

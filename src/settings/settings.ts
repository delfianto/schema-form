import { Plugin } from "obsidian";

export interface SchemaFormSettings {
	schemaDir: string;
	debugFlag: boolean;
}

export const DEFAULT_SETTINGS: SchemaFormSettings = {
	schemaDir: "",
	debugFlag: false,
};

export async function loadSettings(plugin: Plugin): Promise<SchemaFormSettings> {
	return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}

export async function saveSettings(plugin: Plugin, settings: SchemaFormSettings) {
	await plugin.saveData(settings);
}

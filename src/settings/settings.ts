import { Plugin } from "obsidian";

export interface PluginSettings {
	schemaDir: string;
	debugFlag: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	schemaDir: "",
	debugFlag: false,
};

export async function loadSettings(plugin: Plugin): Promise<PluginSettings> {
	return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}

export async function saveSettings(plugin: Plugin, settings: PluginSettings) {
	await plugin.saveData(settings);
}

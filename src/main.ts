import * as Settings from "./settings";
import { App, Plugin, PluginManifest } from "obsidian";

export default class SchemaFormPlugin extends Plugin {
  settings!: Settings.SchemaFormSettings
  private apiReadyPromise: Promise<void>;
	private apiReadyResolve: () => void = () => {};
	private isApiExposed: boolean = false;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.apiReadyPromise = new Promise((resolve) => {
			this.apiReadyResolve = resolve;
		});
	}

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new Settings.SchemaFormSettingTab(this));
  }

	async loadSettings() {
		this.settings = Object.assign(
			{},
			Settings.DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.addSettingTab(new Settings.SchemaFormSettingTab(this.app, this));
	}

}

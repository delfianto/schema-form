import { type App, Plugin, type PluginManifest } from "obsidian";
import * as Log from "./utils/logger";
import * as Settings from "./settings";

export default class SchemaFormPlugin extends Plugin {
  settings!: Settings.SchemaFormSettings;
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
    // Load persisted settings
    await this.loadSettings();

    // Initialize logger with current settings
    Log.initialize(this.settings);
    Log.debug("Settings loaded: ", this.settings)

    // Add the plugin settings tab to Obsidian's UI
    this.addSettingTab(new Settings.SchemaFormSettingTab(this));
  }

  async onunload() {
    Log.info("Schema Form Plugin unloaded");
  }

  async loadSettings() {
    this.settings = Object.assign({}, Settings.DEFAULT_SETTINGS, await this.loadData());

    // Update logger if settings were already initialized
    if (this.settings) {
      Log.updateSettings(this.settings);
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

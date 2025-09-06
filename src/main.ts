import { type App, Plugin, type PluginManifest } from "obsidian";
import * as Settings from "./settings";
import * as Log from "./utils/logger";

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
    Log.debug("Settings loaded: ", this.settings);

    // Add the plugin settings tab to Obsidian's UI
    this.addSettingTab(new Settings.SchemaFormSettingTab(this));
  }

  async onunload() {
    Log.info("Schema Form Plugin unloaded");
  }

  async loadSettings() {
    this.settings = await Settings.load(this);

    if (this.settings) {
      // Update logger if settings were already initialized
      Log.updateSettings(this.settings);
    }
  }

  async saveSettings() {
    await Settings.save(this);
  }
}

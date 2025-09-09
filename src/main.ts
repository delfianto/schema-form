import { Plugin } from "obsidian";
import { registerApi, unregisterApi } from "./api";
import * as Settings from "./settings";
import * as Log from "./utils/logger";

export default class SchemaFormPlugin extends Plugin {
  settings!: Settings.SchemaFormSettings;
  formData: Record<string, unknown> = {};
  labelData: Record<string, string> = {};
  isApiExposed: boolean = false;

  submitFormData(submitted: Record<string, unknown>) {
    this.formData = submitted.data as Record<string, unknown>;
    this.labelData = submitted.label as Record<string, string>;
  }

  async onload() {
    // Load persisted settings
    await this.loadSettings();

    // Initialize logger with current settings
    Log.initialize(this.settings);
    Log.debug("Settings loaded: ", this.settings);

    // Add the plugin settings tab to Obsidian's UI
    this.addSettingTab(new Settings.SchemaFormSettingTab(this));

    // Register scf API
    registerApi(this);
  }

  async onunload() {
    unregisterApi();
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

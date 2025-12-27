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
    this.formData = submitted["data"] as Record<string, unknown>;
    this.labelData = submitted["label"] as Record<string, string>;
  }

  async onload() {
    await this.loadSettings();

    Log.initialize(this.settings);
    Log.debug("Settings loaded: ", this.settings);

    this.addSettingTab(new Settings.SchemaFormSettingTab(this));

    registerApi(this);
  }

  async onunload() {
    unregisterApi();
    Log.info("Schema Form Plugin unloaded");
  }

  async loadSettings() {
    this.settings = await Settings.load(this);

    if (this.settings) {
      Log.updateSettings(this.settings);
    }
  }

  async saveSettings() {
    await Settings.save(this);
  }
}

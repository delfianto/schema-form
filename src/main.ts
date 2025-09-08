import { type App, Plugin, type PluginManifest } from "obsidian";
import * as Settings from "./settings";
import * as Log from "./utils/logger";

declare global {
  interface Window {
    scf: SCFApi;
  }
}

export interface SCFApi {
  value: (fieldName: string) => unknown;
  label: (fieldName: string) => string;
  hasData: () => boolean;
}

export default class SchemaFormPlugin extends Plugin {
  settings!: Settings.SchemaFormSettings;
  private formData: Record<string, unknown> = {};
  private labelData: Record<string, string> = {};

  private isApiExposed: boolean = false;
  private apiReadyPromise: Promise<void>;
  private apiReadyResolve: () => void = () => {};

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.apiReadyPromise = new Promise((resolve) => {
      this.apiReadyResolve = resolve;
    });
  }

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
    this.registerApi();
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

  private getApi(): SCFApi {
    return {
      value: (fieldName: string): unknown => {
        return this.formData[fieldName] || "{{none}}";
      },
      label: (fieldName: string): string => {
        return this.labelData[fieldName] || "{{none}}";
      },
      hasData: (): boolean => {
        return Object.keys(this.formData).length > 0;
      },
    };
  }

  private registerApi() {
    if (!this.isApiExposed) {
      window.scf = this.getApi();
      this.isApiExposed = true;
      console.log("SCF API exposed globally as 'scf'");
    }
  }
}

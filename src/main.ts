import { type App, Plugin } from "obsidian";
import { registerApi, unregisterApi } from "./api";
import { defaultRegistry } from "./form/RendererRegistry";
import {
  DateFieldRenderer,
  MultiSelectFieldRenderer,
  NumberFieldRenderer,
  SelectFieldRenderer,
  TextAreaFieldRenderer,
  TextFieldRenderer,
  ToggleFieldRenderer,
} from "./form/renderers";
import type { SupportedLocale } from "./i18n/types";
import { SchemaLoader } from "./schema/SchemaLoader";
import * as Settings from "./settings";
import * as Log from "./utils/logger";

interface AppWithLocale extends App {
  getLocale?(): string;
}

export default class SchemaFormPlugin extends Plugin {
  settings!: Settings.SchemaFormSettings;
  schemaLoader!: SchemaLoader;
  private _formData: Record<string, unknown> = {};
  private _labelData: Record<string, string> = {};
  isApiExposed: boolean = false;

  get formData(): Record<string, unknown> {
    return { ...this._formData };
  }

  get labelData(): Record<string, string> {
    return { ...this._labelData };
  }

  submitFormData(submitted: { data: Record<string, unknown>; label: Record<string, string> }) {
    this._formData = { ...submitted.data };
    this._labelData = { ...submitted.label };
  }

  resetData() {
    this._formData = {};
    this._labelData = {};
  }

  async onload() {
    await this.loadSettings();

    Log.initialize(this.settings);
    Log.debug("Settings loaded: ", this.settings);

    // Auto-detect locale if enabled
    if (this.settings.autoDetectLocale) {
      this.detectAndSetLocale();
    }

    // Initialize schema loader with current locale
    this.schemaLoader = new SchemaLoader(this.app, this.settings.schemaDir, this.settings.locale);

    this.registerRenderers();

    this.addSettingTab(new Settings.SchemaFormSettingTab(this));

    registerApi(this);
  }

  private registerRenderers() {
    defaultRegistry.register(new TextFieldRenderer());
    defaultRegistry.register(new TextAreaFieldRenderer());
    defaultRegistry.register(new NumberFieldRenderer());
    defaultRegistry.register(new ToggleFieldRenderer());
    defaultRegistry.register(new SelectFieldRenderer());
    defaultRegistry.register(new MultiSelectFieldRenderer());
    defaultRegistry.register(new DateFieldRenderer());
  }

  async onunload() {
    unregisterApi();
    defaultRegistry.clear();
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

    // Recreate schema loader when locale changes
    this.schemaLoader = new SchemaLoader(this.app, this.settings.schemaDir, this.settings.locale);
  }

  /**
   * Detect and set locale from Obsidian
   */
  detectAndSetLocale(): void {
    const obsidianLocale = (this.app as AppWithLocale).getLocale?.() as string | undefined;

    if (obsidianLocale) {
      this.settings.locale = this.mapObsidianToSupportedLocale(obsidianLocale);
    }
  }

  /**
   * Map Obsidian locale code to supported locale
   */
  private mapObsidianToSupportedLocale(obsidianLocale: string): SupportedLocale {
    // Extract base language code
    const base = obsidianLocale.split("-")[0]?.toLowerCase() ?? "en";

    // Map to supported locales
    const localeMap: Record<string, SupportedLocale> = {
      en: "en",
      id: "id",
      ja: "ja",
      zh: "zh",
      ko: "ko",
      es: "es",
      fr: "fr",
      de: "de",
      pt: "pt-BR",
    };

    return localeMap[base] ?? "en";
  }
}

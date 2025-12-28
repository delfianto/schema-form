import { Plugin } from "obsidian";
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
import * as Settings from "./settings";
import * as Log from "./utils/logger";

export default class SchemaFormPlugin extends Plugin {
  settings!: Settings.SchemaFormSettings;
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
  }
}

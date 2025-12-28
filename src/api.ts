import { FormHandler } from "./form";
import type SchemaFormPlugin from "./main";
import { FormError } from "./schema/error";
import * as Log from "./utils/logger";

declare global {
  interface Window {
    scf?: SCFApi;
  }
}

export interface SCFApi {
  readonly version: string;

  readonly value: (fieldName: string) => unknown | null;

  readonly label: (fieldName: string) => string | null;

  readonly hasData: () => boolean;

  readonly triggerForm: (schemaName?: string) => Promise<FormData>;

  readonly reset: () => void;
}

export type FormData = Record<string, unknown> & { readonly __brand: "FormData" };

class SCFApiImpl implements SCFApi {
  readonly version = "1.0.0";
  private lastTrigger = 0;
  private readonly minInterval = 500; // ms between triggers

  constructor(private readonly plugin: SchemaFormPlugin) {}

  value = (fieldName: string): unknown | null => {
    return this.plugin.formData[fieldName] ?? null;
  };

  label = (fieldName: string): string | null => {
    return this.plugin.labelData[fieldName] ?? null;
  };

  hasData = (): boolean => {
    return Object.keys(this.plugin.formData).length > 0;
  };

  triggerForm = async (schemaName?: string): Promise<FormData> => {
    const now = Date.now();
    if (now - this.lastTrigger < this.minInterval) {
      throw new FormError("Rate limit exceeded. Please wait before triggering another form.");
    }
    this.lastTrigger = now;

    try {
      const formHandler = new FormHandler(this.plugin, this.plugin.settings.schemaDir);

      const result = await formHandler.showForm(schemaName);

      if (!result) {
        throw new FormError("Form cancelled by user");
      }

      this.plugin.submitFormData(result);
      return result as unknown as FormData;
    } catch (error) {
      if (error instanceof Error) {
        throw new FormError(`Failed to trigger form: ${error.message}`, error);
      }
      throw new FormError("Unknown error occurred while triggering form");
    }
  };

  reset = (): void => {
    this.plugin.resetData();
  };
}

export function getApi(plugin: SchemaFormPlugin): SCFApi {
  // Always return a fresh API instance tied to the current plugin instance
  // to avoid issues with stale closures during hot reloads
  return new SCFApiImpl(plugin);
}

export function registerApi(plugin: SchemaFormPlugin): void {
  window.scf = getApi(plugin);
  plugin.isApiExposed = true;

  Log.info("✅ SCF API registered successfully");
}

export function unregisterApi(): void {
  if (window.scf) {
    delete window.scf;
    Log.info("🧹 SCF API unregistered");
  }
}

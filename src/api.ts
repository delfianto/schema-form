import { FormHandler } from "./form";
import type SchemaFormPlugin from "./main";
import { FormError } from "./schema/error";

declare global {
  interface Window {
    scf?: SCFApi;
  }
}

export interface SCFApi {
  readonly value: (fieldName: string) => unknown;
  readonly label: (fieldName: string) => string;
  readonly hasData: () => boolean;
  readonly triggerForm: (schemaName?: string) => Promise<FormData>;
  readonly reset: () => void;
}

export type FormData = Record<string, unknown> & { readonly __brand: "FormData" };

class SCFApiImpl implements SCFApi {
  constructor(private readonly plugin: SchemaFormPlugin) {}

  value = (fieldName: string): unknown => {
    return this.plugin.formData[fieldName] ?? null;
  };

  label = (fieldName: string): string => {
    return this.plugin.labelData[fieldName] ?? fieldName;
  };

  hasData = (): boolean => {
    return Object.keys(this.plugin.formData).length > 0;
  };

  // Modern async method with proper error handling
  triggerForm = async (): Promise<FormData> => {
    try {
      const formHandler = new FormHandler(this.plugin, this.plugin.settings.schemaDir);

      this.reset();
      const result = await formHandler.showForm();

      if (!result) {
        throw new FormError("Form was cancelled or returned no data");
      }

      this.plugin.submitFormData(result);
      return result as FormData;
    } catch (error) {
      // Modern error handling with proper typing
      if (error instanceof Error) {
        throw new FormError(`Failed to trigger form: ${error.message}`, error);
      }
      throw new FormError("Unknown error occurred while triggering form");
    }
  };

  reset = (): void => {
    this.plugin.formData = {};
    this.plugin.labelData = {};
  };
}

let apiInstance: SCFApi | null = null;

export function getApi(plugin: SchemaFormPlugin): SCFApi {
  if (!apiInstance) {
    apiInstance = new SCFApiImpl(plugin);
  }
  return apiInstance;
}

export function registerApi(plugin: SchemaFormPlugin): void {
  if (window.scf) {
    console.warn("SCF API already registered, skipping...");
    return;
  }

  window.scf = getApi(plugin);
  plugin.isApiExposed = true;

  console.log("✅ SCF API registered successfully");
}

export function unregisterApi(): void {
  if (window.scf) {
    delete window.scf;
    apiInstance = null;
    console.log("🧹 SCF API unregistered");
  }
}

// Utility types for better TypeScript experience
export type ApiMethods = keyof SCFApi;
export type ValueGetter = SCFApi["value"];
export type LabelGetter = SCFApi["label"];

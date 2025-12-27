import { FormHandler } from "./form";
import type SchemaFormPlugin from "./main";
import { FormError } from "./schema/error";
import * as Log from "./utils/logger";

declare global {
  interface Window {
    scf?: SCFApi;
  }
}

/**
 * Public API for the Schema Form plugin.
 * Accessible via `window.scf`.
 */
export interface SCFApi {
  /**
   * Retrieves the value of a specific form field from the last submission.
   * @param fieldName The name of the field to retrieve.
   * @returns The value of the field, or null if not found.
   */
  readonly value: (fieldName: string) => unknown;

  /**
   * Retrieves the label of a specific form field from the last submission.
   * @param fieldName The name of the field.
   * @returns The label of the field, or the fieldName if no label is found.
   */
  readonly label: (fieldName: string) => string;

  /**
   * Checks if there is any data from a previous form submission.
   * @returns True if form data exists, false otherwise.
   */
  readonly hasData: () => boolean;

  /**
   * Triggers the schema selection and form modal.
   * @param schemaName Optional name of a specific schema file to trigger directly.
   * @returns A promise that resolves to the submitted form data.
   * @throws FormError if the form is cancelled or an error occurs.
   */
  readonly triggerForm: (schemaName?: string) => Promise<FormData>;

  /**
   * Resets the internal form data and labels.
   */
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
    Log.warn("SCF API already registered, skipping...");
    return;
  }

  window.scf = getApi(plugin);
  plugin.isApiExposed = true;

  Log.info("✅ SCF API registered successfully");
}

export function unregisterApi(): void {
  if (window.scf) {
    delete window.scf;
    apiInstance = null;
    Log.info("🧹 SCF API unregistered");
  }
}

import type { SchemaFormSettings } from "../settings";

let currentSettings: SchemaFormSettings;

export function initialize(settings: SchemaFormSettings): void {
  currentSettings = settings;
}

export function updateSettings(settings: SchemaFormSettings): void {
  currentSettings = settings;
}

export const isDebugEnabled = () => currentSettings?.debugFlag || false;
export const info = (...args: unknown[]) => console.info("ℹ️", ...args);
export const warn = (...args: unknown[]) => console.warn("⚠️", ...args);
export const error = (...args: unknown[]) => console.error("💀", ...args);
export const debug = (...args: unknown[]) => {
  if (currentSettings?.debugFlag) {
    console.debug("🤖", ...args);
  }
};

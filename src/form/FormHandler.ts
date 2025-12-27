import { type App, Notice, type TFile } from "obsidian";
import type SchemaFormPlugin from "../main";
import { listFiles, loadSchema, type Schema } from "../schema";
import { SchemaError } from "../schema/error";
import * as Log from "../utils/logger";
import { assertIsError } from "../utils/quirks";
import { DebugErrorModal } from "./DebugErrorModal";
import { FileSelectorModal } from "./FileSelectorModal";
import { SchemaFormModal } from "./SchemaFormModal";

export class FormHandler {
  private app: App;
  private plugin: SchemaFormPlugin;
  private schemaDir: string;

  constructor(plugin: SchemaFormPlugin, schemaDir: string = "") {
    this.app = plugin.app;
    this.plugin = plugin;
    this.schemaDir = schemaDir;
  }

  async showForm() {
    try {
      const schemaFiles = await listFiles(this.app, this.schemaDir);
      const selectedFile = await this.displaySelector(schemaFiles);

      if (!selectedFile) {
        new Notice("No file selected");
        return null;
      }

      const schema = await loadSchema(this.app, selectedFile);

      if (!schema) {
        new Notice("Failed to load schema");
        return null;
      }

      return this.displayModalForm(schema);
    } catch (error) {
      assertIsError(error);

      // Show user-friendly error modal for schema errors
      if (error instanceof SchemaError) {
        Log.error("Schema error occurred:", error);

        // Show detailed error modal to help user fix the schema
        new DebugErrorModal(this.app, error, "Schema Loading Error").open();

        // Also show a brief notice
        new Notice(`Schema error: ${error.message}`);
      } else {
        // For unexpected errors, still show the debug modal
        Log.error("Unexpected error in showForm:", error);
        new DebugErrorModal(this.app, error, "Unexpected Error").open();
        new Notice("An unexpected error occurred. See error details in the modal.");
      }

      return null;
    }
  }

  private displaySelector(files: TFile[]): Promise<TFile | null> {
    return new Promise((resolve) => {
      if (files.length === 1) {
        resolve(files[0]);
        return;
      }

      new FileSelectorModal(this.app, files, (selectedFile) => {
        resolve(selectedFile);
      }).open();
    });
  }

  private displayModalForm(schema: Schema): Promise<Record<string, unknown> | null> {
    return new Promise((resolve) => {
      new SchemaFormModal(this.app, this.plugin, schema, (data) => {
        resolve(data);
      }).open();
    });
  }
}

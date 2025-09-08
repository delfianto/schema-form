import { type App, Notice, type TFile } from "obsidian";
import type SchemaFormPlugin from "../main";
import { listFiles, loadSchema, type Schema } from "../schema";
import { SchemaFormModal } from "./schema-ui";
import { FileSelectorModal } from "./selector-ui";

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
      console.error("Unexpected error", error);
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

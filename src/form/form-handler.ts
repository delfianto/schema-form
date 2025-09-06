import { type App, Notice, type TFile } from "obsidian";
import { listFiles, loadSchema, type Schema } from "../schema";
import { ResultHelpers } from "../utils/result";
import { SchemaFormModal } from "./schema-ui";
import { FileSelectorModal } from "./selector-ui";

export class FormHandler {
  private app: App;
  private schemaDir: string;

  constructor(app: App, schemaDir: string = "") {
    this.app = app;
    this.schemaDir = schemaDir;
  }

  async showForm() {
    try {
      const schemaFiles = ResultHelpers.unwrapOrThrow(
        await listFiles(this.app, this.schemaDir)
      ).files;

      const selectedFile = await this.displaySelector(schemaFiles);

      if (!selectedFile) {
        new Notice("No file selected");
        return null;
      }

      const schema = ResultHelpers.unwrapOrThrow(await loadSchema(this.app, selectedFile)).schema;

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

  private displayModalForm(schema: Schema): Promise<Record<string, any> | null> {
    return new Promise((resolve) => {
      new SchemaFormModal(this.app, schema, (data) => {
        resolve(data);
      }).open();
    });
  }
}

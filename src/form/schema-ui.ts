import { type App, Modal, Notice, Setting } from "obsidian";
import type { Schema } from "../schema";
import { FormRenderer } from "./form-renderer";
import { FormState } from "./form-state";

export class SchemaFormModal extends Modal {
  formState: FormState;
  formRenderer: FormRenderer;

  schema: Schema;
  fieldElements: Map<string, HTMLElement> = new Map();

  onSubmit: (data: Record<string, unknown> | null) => void;
  isSubmitted: boolean = false;

  constructor(app: App, schema: Schema, onSubmit: (data: Record<string, unknown> | null) => void) {
    super(app);
    this.formState = new FormState();
    this.formRenderer = new FormRenderer(this.formState);

    this.schema = schema;
    this.onSubmit = onSubmit;

    // Debug logging
    this.debugLog("Constructor called with schema:", schema);

    // Validate schema structure
    if (!schema) {
      throw new Error("Schema is null or undefined");
    }

    if (!schema.fields) {
      throw new Error("Schema must have a 'fields' property");
    }

    if (!Array.isArray(schema.fields)) {
      throw new Error("Schema 'fields' must be an array");
    }

    this.debugLog("Schema validation passed, field count:", schema.fields.length);
  }

  private debugLog(message: string, ...args: unknown[]) {
    if (this.app) {
      console.log(`SchemaFormModal: ${message}`, ...args);
    }
  }

  onOpen() {
    this.debugLog("onOpen called");
    const { contentEl } = this;

    try {
      contentEl.createEl("h2", { text: "Form" });

      // Validate schema.fields exists and is an array before forEach
      if (!this.schema.fields || !Array.isArray(this.schema.fields)) {
        throw new Error(`Invalid schema structure: fields is ${typeof this.schema.fields}`);
      }

      this.debugLog("About to render", this.schema.fields.length, "fields");
      this.formRenderer.renderSchema(contentEl, this.schema);

      // Submit button
      new Setting(contentEl)
        .addButton((btn) =>
          btn
            .setButtonText("Submit")
            .setCta()
            .onClick(() => this.handleSubmit())
        )
        .addButton((btn) => btn.setButtonText("Cancel").onClick(() => this.close()));
    } catch (error) {
      console.error("SchemaFormModal: Error in onOpen:", error);
      contentEl.createEl("div", {
        text: `Error rendering form`,
        cls: "schema-form-error",
      });

      // Still show cancel button
      new Setting(contentEl).addButton((btn) =>
        btn.setButtonText("Close").onClick(() => this.close())
      );
    }
  }

  handleSubmit() {
    const formData = this.formState.getAllData();
    this.isSubmitted = true;
    this.onSubmit(formData);
    this.close();
  }

  onClose() {
    this.contentEl.empty();
    if (!this.isSubmitted) {
      new Notice("Dialog closed, returning empty object.");
      this.onSubmit({});
    }
  }
}

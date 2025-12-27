import { type App, Modal, Notice, Setting } from "obsidian";
import type { Schema } from "../schema";
import { cssClass, SCHEMA_FORM_STYLE } from "../style";
import * as Log from "../utils/logger";
import { FormRenderer } from "./FormRenderer";
import { FormState } from "./FormState";

export class SchemaFormModal extends Modal {
  formState: FormState;
  formRenderer: FormRenderer;

  schema: Schema;

  fieldElements: Map<string, HTMLElement> = new Map();
  onSubmit: (data: { data: Record<string, unknown>; label: Record<string, string> } | null) => void;
  isSubmitted: boolean = false;

  constructor(
    app: App,
    schema: Schema,
    onSubmit: (
      data: { data: Record<string, unknown>; label: Record<string, string> } | null,
    ) => void,
  ) {
    super(app);
    this.formState = new FormState();
    this.formRenderer = new FormRenderer(this.formState);

    this.schema = schema;
    this.onSubmit = onSubmit;

    this.debugLog("Constructor called with schema:", schema);

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
    Log.debug(`SchemaFormModal: ${message}`, ...args);
  }

  onOpen() {
    this.debugLog("onOpen called");
    const { contentEl } = this;

    try {
      contentEl.createEl("h2", { text: "Form" });

      if (!this.schema.fields || !Array.isArray(this.schema.fields)) {
        throw new Error(`Invalid schema structure: fields is ${typeof this.schema.fields}`);
      }

      this.debugLog("About to render", this.schema.fields.length, "fields");
      this.formRenderer.renderSchema(contentEl, this.schema);

      new Setting(contentEl)
        .addButton((btn) =>
          btn
            .setButtonText("Submit")
            .setCta()
            .onClick(() => this.handleSubmit()),
        )
        .addButton((btn) => btn.setButtonText("Cancel").onClick(() => this.close()));
    } catch (error) {
      Log.error("SchemaFormModal: Error in onOpen:", error);
      contentEl.createEl("div", {
        text: `Error rendering form`,
        cls: cssClass(SCHEMA_FORM_STYLE.FORM_ERROR),
      });

      new Setting(contentEl).addButton((btn) =>
        btn.setButtonText("Close").onClick(() => this.close()),
      );
    }
  }

  handleSubmit() {
    const { isValid, errors } = this.formState.validateAll();

    if (!isValid) {
      new Notice("Please fix the errors in the form before submitting.");
      this.debugLog("Validation failed:", errors);
      return;
    }

    const formData = this.formState.getAllData() as {
      data: Record<string, unknown>;
      label: Record<string, string>;
    };
    this.isSubmitted = true;

    this.onSubmit(formData);
    this.close();
  }

  onClose() {
    this.contentEl.empty();
    if (!this.isSubmitted) {
      this.onSubmit(null);
    }
  }
}

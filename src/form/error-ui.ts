import { type App, Modal, Setting } from "obsidian";
import type { LoaderErrType } from "../schema";
import { SCHEMA_FORM_STYLE } from "../ui";
import type { Err } from "../utils/result";

export class SchemaErrorModal extends Modal {
  error: Err<LoaderErrType>;
  fileName: string;

  constructor(app: App, fileName: string, error: Err<LoaderErrType>) {
    super(app);
    this.fileName = fileName;
    this.error = error;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Schema Parse Error" });

    contentEl.createEl("p", {
      text: `Unable to parse the schema file: ${this.fileName}`,
    });

    contentEl.createEl("p", {
      text: "Please check that the schema file contains a valid JSON or YAML code block.",
    });

    const detailsEl = contentEl.createEl("details");
    detailsEl.createEl("summary", { text: "Error Details" });

    if (this.error.details) {
      const stackDetailsEl = contentEl.createEl("details");
      stackDetailsEl.createEl("summary", { text: "Full Stacktrace (Debug)" });

      const stackTextarea = stackDetailsEl.createEl("textarea", {
        cls: SCHEMA_FORM_STYLE.ERROR_STACKTRACE,
      });

      stackTextarea.readOnly = true;
      stackTextarea.value = this.getFullErrorDetails();
    }

    contentEl.createEl("p", {
      text: "For more detailed error information, check the Developer Console (Ctrl+Shift+I or Cmd+Option+I).",
    });

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("OK")
        .setCta()
        .onClick(() => this.close())
    );
  }

  onClose() {
    this.contentEl.empty();
  }

  private getFullErrorDetails(): string {
    const details = this.error.details;
    if (!details) {
      return this.error.message;
    }

    let errorInfo = `Primary Error: ${details.message}\n\n`;

    if (details.stack) {
      errorInfo += `Stack Trace:\n${details.stack}\n\n`;
    }

    if (details.cause) {
      const cause = details.cause as Error;
      errorInfo += `Root Cause: ${cause.message}\n`;

      if (cause.stack) {
        errorInfo += `Root Cause Stack:\n${cause.stack}\n\n`;
      }
    }

    // Add metadata
    errorInfo += `Error Type: ${this.error.error}\n`;
    errorInfo += `Schema File: ${this.fileName}\n`;
    errorInfo += `Timestamp: ${new Date().toISOString()}\n`;

    return errorInfo;
  }
}

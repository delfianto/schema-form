import { type App, Modal, Setting } from "obsidian";
import { assertIsError } from "../utils/quirks";
import { renderFromObject } from "./tree-renderer";

function errorToObject(error: Error): Record<string, unknown> {
  // Start with enumerable properties
  const obj: Record<string, unknown> = { ...error };

  // Ensure standard Error properties are included
  // even if they are non-enumerable on the original instance
  if (error.name !== undefined) obj.name = error.name;
  if (error.message !== undefined) obj.message = error.message;
  if (error.stack !== undefined) obj.stack = error.stack;

  // Recursively handle cause if it's also an Error
  if (error.cause !== undefined) obj.cause = error.cause;

  // Add the type for clarity in the tree view
  obj.___errorType___ = "Error Instance";

  return obj;
}

export class DebugErrorModal extends Modal {
  private errorToShow: Error;
  private contextLabel: string;

  constructor(app: App, error: Error, contextLabel: string = "An Error Occurred") {
    super(app);
    this.errorToShow = error;
    this.contextLabel = contextLabel;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    // Create a user-friendly title
    contentEl.createEl("h2", { text: `Debug: ${this.contextLabel}` });
    contentEl.createEl("p", { text: "Details of the error are shown below:" });

    // Convert Error to a renderable object
    const errorAsObject = errorToObject(this.errorToShow);

    // Create a container div for the tree
    const treeContainer = contentEl.createEl("div");
    treeContainer.addClass("scf-debug-error-tree"); // For potential styling

    try {
      // Use the existing render function
      renderFromObject(treeContainer, errorAsObject, "Error Details");

      // Optional: Add a direct link to DevTools console for stack trace
      contentEl.createEl("p", {
        text: "For more detailed stack information, check the Developer Console (Ctrl+Shift+I or Cmd+Option+I).",
      });
    } catch (renderError) {
      assertIsError(renderError);
      console.error("Error rendering debug error tree:", renderError);
      treeContainer.createEl("p", { text: "An error occurred while rendering the error details." });
      treeContainer.createEl("pre", { text: renderError.message || String(renderError) });
    }

    // Add a clear/dismiss button
    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Close")
        .setCta()
        .onClick(() => {
          this.close();
        })
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

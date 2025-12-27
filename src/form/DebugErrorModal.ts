import { type App, Modal, Setting } from "obsidian";
import { cssClass, SCHEMA_FORM_STYLE } from "../style";
import { assertIsError } from "../utils/quirks";
import { renderFromObject } from "./treeRenderer";

function errorToObject(error: Error): Record<string, unknown> {
  const obj: Record<string, unknown> = { ...error };

  if (error.name !== undefined) obj["name"] = error.name;
  if (error.message !== undefined) obj["message"] = error.message;
  if (error.stack !== undefined) obj["stack"] = error.stack;

  if (error.cause !== undefined) obj["cause"] = error.cause;

  obj["___errorType___"] = "Error Instance";

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

    contentEl.createEl("h2", { text: `Debug: ${this.contextLabel}` });
    contentEl.createEl("p", { text: "Details of the error are shown below:" });

    const errorAsObject = errorToObject(this.errorToShow);

    const treeContainer = contentEl.createEl("div");
    treeContainer.addClass(cssClass(SCHEMA_FORM_STYLE.DEBUG_ERROR_TREE));

    try {
      renderFromObject(treeContainer, errorAsObject, "Error Details");

      contentEl.createEl("p", {
        text: "For more detailed stack information, check the Developer Console (Ctrl+Shift+I or Cmd+Option+I).",
      });
    } catch (renderError) {
      assertIsError(renderError);
      console.error("Error rendering debug error tree:", renderError);
      treeContainer.createEl("p", { text: "An error occurred while rendering the error details." });
      treeContainer.createEl("pre", { text: renderError.message || String(renderError) });
    }

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Close")
        .setCta()
        .onClick(() => {
          this.close();
        }),
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

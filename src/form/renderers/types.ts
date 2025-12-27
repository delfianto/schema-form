import type { Setting } from "obsidian";
import type { Field } from "../../schema/definitions";
import type { FormState } from "../FormState";

export interface FieldRendererStrategy<T extends Field = Field> {
  supports(type: string): boolean;

  render(container: HTMLElement, field: T, state: FormState): void;

  getValidator(field: T): (value: unknown) => string[];
}

export abstract class BaseFieldRenderer {
  protected label(field: Field): string {
    return (field.label || field.name) + (field.required ? " *" : "");
  }

  protected desc(field: Field): string | DocumentFragment {
    return field.description || "";
  }

  protected placeholder(field: Field & { placeholder?: string }): string {
    if (field.placeholder) return field.placeholder;
    return field.required ? "Required" : "Optional";
  }

  protected stateValue(field: Field, state: FormState): unknown {
    return state.getValue(field.name);
  }

  protected setupErrorFeedback(
    container: HTMLElement,
    field: Field,
    state: FormState,
    setting: Setting,
  ): void {
    const errorId = `error-${field.name}`;
    const errorDiv = container.createEl("div", {
      cls: "scf-error-message",
      attr: { id: errorId, role: "alert" },
    });

    const inputEl = setting.controlEl.querySelector("input, select, textarea");
    if (inputEl) {
      inputEl.setAttribute("aria-describedby", errorId);
    }

    state.onErrorChange(field.name, (errors) => {
      if (errors.length > 0) {
        setting.controlEl.addClass("has-error");
        errorDiv.setText(errors[0] ?? "Invalid value");
        errorDiv.addClass("visible");
        if (inputEl) inputEl.setAttribute("aria-invalid", "true");
      } else {
        setting.controlEl.removeClass("has-error");
        errorDiv.removeClass("visible");
        errorDiv.setText("");
        if (inputEl) inputEl.setAttribute("aria-invalid", "false");
      }
    });

    const val = state.getValue(field.name);
    if (val !== undefined && val !== "") {
      const errors = state.validateField(field.name);
      if (errors.length > 0) {
        setting.controlEl.addClass("has-error");
        errorDiv.setText(errors[0] ?? "Invalid value");
        errorDiv.addClass("visible");
        if (inputEl) inputEl.setAttribute("aria-invalid", "true");
      }
    }
  }

  protected validateRequired(field: Field, value: unknown): string[] {
    const errors: string[] = [];
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && isEmpty) {
      errors.push(`${field.label || field.name} is required`);
    }
    return errors;
  }
}

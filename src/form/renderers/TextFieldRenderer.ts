import { debounce, Setting } from "obsidian";
import type { TextField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class TextFieldRenderer extends BaseFieldRenderer implements FieldRendererStrategy {
  supports(type: string): boolean {
    return type === "TEXT";
  }

  render(container: HTMLElement, field: TextField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addText((text) => {
      text
        .setPlaceholder(this.placeholder(field))
        .setValue(this.stateValue(field, state))
        .onChange(
          debounce((value) => {
            state.setValue(field.name, value);
          }, 300)
        );
    });
  }

  getValidator(field: TextField): (value: unknown) => string[] {
    return (value: unknown) => {
      const errors = this.validateRequired(field, value);
      if (typeof value === "string" && value.length > 0) {
        if (field.minLength && value.length < field.minLength) {
          errors.push(`Minimum length is ${field.minLength}`);
        }
        if (field.maxLength && value.length > field.maxLength) {
          errors.push(`Maximum length is ${field.maxLength}`);
        }
        if (field.regex) {
          try {
            const re = new RegExp(field.regex);
            if (!re.test(value)) {
              errors.push("Invalid format");
            }
          } catch (_e) {
            // If regex is invalid in schema, we don't want to crash the form
          }
        }
      }
      return errors;
    };
  }
}

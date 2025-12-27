import { debounce, Setting } from "obsidian";
import type { TextAreaField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class TextAreaFieldRenderer extends BaseFieldRenderer implements FieldRendererStrategy {
  supports(type: string): boolean {
    return type === "TEXT_AREA";
  }

  render(container: HTMLElement, field: TextAreaField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addTextArea((textarea) => {
      textarea
        .setPlaceholder(this.placeholder(field))
        .setValue(this.stateValue(field, state))
        .onChange(
          debounce((value) => {
            state.setValue(field.name, value);
          }, 300)
        );
    });
  }

  getValidator(field: TextAreaField): (value: unknown) => string[] {
    return (value: unknown) => {
      const errors = this.validateRequired(field, value);
      if (typeof value === "string" && value.length > 0) {
        if (field.maxLength && value.length > field.maxLength) {
          errors.push(`Maximum length is ${field.maxLength}`);
        }
      }
      return errors;
    };
  }
}

import { debounce, Setting } from "obsidian";
import type { NumberField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class NumberFieldRenderer extends BaseFieldRenderer implements FieldRendererStrategy {
  supports(type: string): boolean {
    return type === "NUMBER";
  }

  render(container: HTMLElement, field: NumberField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addText((text) => {
      text.inputEl.type = "number";
      text.setPlaceholder(this.placeholder(field)).setValue(this.stateValue(field, state));

      if (field.min !== undefined) {
        text.inputEl.min = String(field.min);
      }

      if (field.max !== undefined) {
        text.inputEl.max = String(field.max);
      }

      if (field.step !== undefined) {
        text.inputEl.step = String(field.step);
      }

      text.onChange(
        debounce((value) => {
          state.setValue(field.name, value ? Number(value) : undefined);
        }, 300)
      );
    });
  }

  getValidator(field: NumberField): (value: unknown) => string[] {
    return (value: unknown) => {
      const errors = this.validateRequired(field, value);
      if (typeof value === "number") {
        if (field.min !== undefined && value < field.min) {
          errors.push(`Minimum value is ${field.min}`);
        }
        if (field.max !== undefined && value > field.max) {
          errors.push(`Maximum value is ${field.max}`);
        }
      }
      return errors;
    };
  }
}

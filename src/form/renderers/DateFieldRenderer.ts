import { Setting } from "obsidian";
import type { DateField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class DateFieldRenderer extends BaseFieldRenderer implements FieldRendererStrategy {
  supports(type: string): boolean {
    return type === "DATE";
  }

  render(container: HTMLElement, field: DateField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addText((text) => {
      text.inputEl.type = "date";

      const currentValue = state.getValue(field.name) as string | undefined;
      const stringValue = currentValue || "";
      text.setValue(stringValue);

      if (field.minDate) {
        text.inputEl.min = field.minDate;
      }

      if (field.maxDate) {
        text.inputEl.max = field.maxDate;
      }

      text.onChange((value) => {
        state.setValue(field.name, value);
      });

      text.setPlaceholder(this.placeholder(field));
    });
  }

  getValidator(field: DateField): (value: unknown) => string[] {
    return (value: unknown) => {
      const errors = this.validateRequired(field, value);
      if (typeof value === "string" && value.length > 0) {
        const selectedDate = new Date(value);
        if (!Number.isNaN(selectedDate.getTime())) {
          if (field.minDate) {
            const min = new Date(field.minDate);
            if (!Number.isNaN(min.getTime()) && selectedDate < min) {
              errors.push(`Date must be after ${field.minDate}`);
            }
          }
          if (field.maxDate) {
            const max = new Date(field.maxDate);
            if (!Number.isNaN(max.getTime()) && selectedDate > max) {
              errors.push(`Date must be before ${field.maxDate}`);
            }
          }
        }
      }
      return errors;
    };
  }
}

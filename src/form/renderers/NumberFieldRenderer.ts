import { debounce, Setting } from "obsidian";
import { z } from "zod";
import type { NumberField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class NumberFieldRenderer
  extends BaseFieldRenderer
  implements FieldRendererStrategy<NumberField>
{
  supports(type: string): boolean {
    return type === "NUMBER";
  }

  render(container: HTMLElement, field: NumberField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addText((text) => {
      text.inputEl.type = "number";

      if (field.min !== undefined) text.inputEl.min = String(field.min);
      if (field.max !== undefined) text.inputEl.max = String(field.max);
      if (field.step !== undefined) text.inputEl.step = String(field.step);

      text
        .setPlaceholder(this.placeholder(field))
        .setValue(String(this.stateValue(field, state) ?? ""))
        .onChange(
          debounce((value) => {
            const numVal = value === "" ? undefined : Number(value);
            state.setValue(field.name, numVal);
          }, 300),
        );
    });

    this.setupErrorFeedback(container, field, state, setting);
  }

  getValidator(field: NumberField): (value: unknown) => string[] {
    return (value: unknown) => {
      // Handle empty values
      if (value === "" || value === undefined || value === null) {
        if (field.required) return ["This field is required"];
        return [];
      }

      // Build schema based on field configuration
      let schema = z.number({ message: "Must be a number" });

      if (field.min !== undefined) {
        schema = schema.min(field.min, `Minimum value is ${field.min}`);
      }
      if (field.max !== undefined) {
        schema = schema.max(field.max, `Maximum value is ${field.max}`);
      }

      const result = schema.safeParse(value);
      return result.success ? [] : result.error.issues.map((e) => e.message);
    };
  }
}

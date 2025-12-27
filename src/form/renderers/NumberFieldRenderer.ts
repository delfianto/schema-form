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
    let schema: z.ZodNumber = z.number();

    if (field.min !== undefined) {
      schema = schema.min(field.min, `Minimum value is ${field.min}`);
    }
    if (field.max !== undefined) {
      schema = schema.max(field.max, `Maximum value is ${field.max}`);
    }

    let finalSchema: z.ZodType<unknown> = schema;

    if (!field.required) {
      finalSchema = schema.optional().or(z.null()).or(z.undefined());
    } else {
      finalSchema = schema.refine((val) => val !== undefined && val !== null, {
        message: "This field is required",
      });
    }

    return (value: unknown) => {
      // Handle empty string from input if not required
      if (!field.required && (value === "" || value === undefined || value === null)) {
        return [];
      }
      const result = finalSchema.safeParse(value);
      if (result.success) return [];
      return result.error.issues.map((e) => e.message);
    };
  }
}

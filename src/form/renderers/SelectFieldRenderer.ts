import { Setting } from "obsidian";
import { z } from "zod";
import type { SelectField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class SelectFieldRenderer
  extends BaseFieldRenderer
  implements FieldRendererStrategy<SelectField>
{
  supports(type: string): boolean {
    return type === "SELECT";
  }

  render(container: HTMLElement, field: SelectField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addDropdown((dropdown) => {
      if (field.options && Array.isArray(field.options)) {
        field.options.forEach((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          dropdown.addOption(value, label);
        });

        const currentValue = this.stateValue(field, state) as string | undefined;
        const stringValue =
          currentValue ||
          (typeof field.options[0] === "string" ? field.options[0] : field.options[0]?.value) ||
          "";
        dropdown.setValue(stringValue);

        if (!currentValue) {
          state.setValue(field.name, stringValue);
        }
      }

      dropdown.onChange((value) => {
        state.setValue(field.name, value);
      });
    });

    this.setupErrorFeedback(container, field, state, setting);
  }
  getValidator(field: SelectField): (value: unknown) => string[] {
    const options = field.options.map((o) => (typeof o === "string" ? o : o.value));
    let schema: z.ZodTypeAny = z.string();

    if (options.length > 0) {
      schema = z.enum(options as [string, ...string[]]);
    }

    let finalSchema: z.ZodTypeAny = schema;

    if (!field.required) {
      finalSchema = schema.optional().or(z.literal("")).or(z.null());
    } else {
      finalSchema = schema.refine((val) => val !== undefined && val !== null && val !== "", {
        message: "This field is required",
      });
    }

    return (value: unknown) => {
      const result = finalSchema.safeParse(value);
      if (result.success) return [];
      return result.error.issues.map((e) => e.message);
    };
  }
}

import { Setting } from "obsidian";
import { z } from "zod";
import type { DateField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class DateFieldRenderer
  extends BaseFieldRenderer
  implements FieldRendererStrategy<DateField>
{
  supports(type: string): boolean {
    return type === "DATE";
  }

  render(container: HTMLElement, field: DateField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addText((text) => {
      text.inputEl.type = "date";

      if (field.minDate) text.inputEl.min = field.minDate;
      if (field.maxDate) text.inputEl.max = field.maxDate;

      text
        .setPlaceholder(this.placeholder(field))
        .setValue(String(this.stateValue(field, state) ?? ""))
        .onChange((value) => {
          state.setValue(field.name, value);
        });
    });

    this.setupErrorFeedback(container, field, state, setting);
  }
  getValidator(field: DateField): (value: unknown) => string[] {
    let schema: z.ZodType<string | null | undefined> = z.string();

    if (!field.required) {
      schema = z.string().optional().or(z.literal("")).or(z.null());
    } else {
      schema = z.string().min(1, "This field is required");
    }

    let finalSchema: z.ZodType<unknown> = schema.refine(
      (val: unknown) => {
        if (!val) return true;
        const d = new Date(val as string);
        return !Number.isNaN(d.getTime());
      },
      { message: "Invalid date" },
    );

    if (field.minDate) {
      finalSchema = finalSchema.refine(
        (val: unknown) => {
          if (!val) return true;
          const d = new Date(val as string);
          const minDateStr = field.minDate;
          if (!minDateStr) return true;
          const min = new Date(minDateStr);
          return d >= min;
        },
        { message: `Date must be after ${field.minDate}` },
      );
    }

    if (field.maxDate) {
      finalSchema = finalSchema.refine(
        (val: unknown) => {
          if (!val) return true;
          const d = new Date(val as string);
          const maxDateStr = field.maxDate;
          if (!maxDateStr) return true;
          const max = new Date(maxDateStr);
          return d <= max;
        },
        { message: `Date must be before ${field.maxDate}` },
      );
    }

    return (value: unknown) => {
      const result = finalSchema.safeParse(value);
      if (result.success) return [];
      return result.error.issues.map((e) => e.message);
    };
  }
}

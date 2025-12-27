import { Setting } from "obsidian";
import { z } from "zod";
import type { MultiSelectField } from "../../schema/definitions";
import { cssClass, SCHEMA_FORM_STYLE } from "../../style";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class MultiSelectFieldRenderer
  extends BaseFieldRenderer
  implements FieldRendererStrategy<MultiSelectField>
{
  supports(type: string): boolean {
    return type === "MULTI_SELECT";
  }

  render(container: HTMLElement, field: MultiSelectField, state: FormState): void {
    new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    const optionsContainer = container.createDiv({
      cls: cssClass(SCHEMA_FORM_STYLE.MULTI_SELECT_CONTAINER || "multi-select-container"),
    });

    const selectedValues = new Set<string>((state.getValue(field.name) as string[]) || []);

    if (field.options && Array.isArray(field.options)) {
      field.options.forEach((option) => {
        const value = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;

        const row = optionsContainer.createDiv({
          cls: cssClass(SCHEMA_FORM_STYLE.MULTI_SELECT_ROW),
        });
        const checkbox = row.createEl("input", { type: "checkbox" });
        checkbox.checked = selectedValues.has(value);
        row.createEl("label", { text: label });

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedValues.add(value);
          } else {
            selectedValues.delete(value);
          }
          state.setValue(field.name, Array.from(selectedValues));
        });
      });
    }
  }

  getValidator(field: MultiSelectField): (value: unknown) => string[] {
    const validOptions = field.options.map((o) => (typeof o === "string" ? o : o.value));
    let schema: z.ZodTypeAny = z.array(z.string());

    if (validOptions.length > 0) {
      schema = z.array(z.enum(validOptions as [string, ...string[]]));
    }

    let finalSchema: z.ZodTypeAny = schema;

    if (field.required) {
      finalSchema = (schema as z.ZodArray<z.ZodTypeAny>).min(
        1,
        "At least one option must be selected"
      );
    }

    if (field.maxSelections) {
      finalSchema = (finalSchema as z.ZodArray<z.ZodTypeAny>).max(
        field.maxSelections,
        `Maximum ${field.maxSelections} selections allowed`
      );
    }

    return (value: unknown) => {
      const result = finalSchema.safeParse(value || []);
      if (result.success) return [];
      return result.error.issues.map((e) => e.message);
    };
  }
}

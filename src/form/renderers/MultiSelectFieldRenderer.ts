import { Setting } from "obsidian";
import type { MultiSelectField } from "../../schema/definitions";
import { cssClass, SCHEMA_FORM_STYLE } from "../../style";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class MultiSelectFieldRenderer extends BaseFieldRenderer implements FieldRendererStrategy {
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
    return (value: unknown) => {
      const errors = this.validateRequired(field, value);
      if (Array.isArray(value)) {
        if (field.maxSelections && value.length > field.maxSelections) {
          errors.push(`Maximum ${field.maxSelections} selections allowed`);
        }
      }
      return errors;
    };
  }
}

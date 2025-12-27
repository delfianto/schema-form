import { Setting } from "obsidian";
import type { SelectField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class SelectFieldRenderer extends BaseFieldRenderer implements FieldRendererStrategy {
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

        const currentValue = state.getValue(field.name) as string | undefined;
        const stringValue =
          currentValue ||
          (typeof field.options[0] === "string" ? field.options[0] : field.options[0]?.value) ||
          "";
        dropdown.setValue(stringValue);

        if (!state.getValue(field.name)) {
          state.setValue(field.name, stringValue);
        }
      }

      dropdown.onChange((value) => {
        state.setValue(field.name, value);
      });
    });
  }

  getValidator(field: SelectField): (value: unknown) => string[] {
    return (value: unknown) => {
      return this.validateRequired(field, value);
    };
  }
}

import { Setting } from "obsidian";
import type { ToggleField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class ToggleFieldRenderer extends BaseFieldRenderer implements FieldRendererStrategy {
  supports(type: string): boolean {
    return type === "TOGGLE";
  }

  render(container: HTMLElement, field: ToggleField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addToggle((toggle) => {
      const currentValue = state.getValue(field.name) as boolean | undefined;
      const booleanValue = currentValue ?? field.default ?? false;

      toggle.setValue(booleanValue).onChange((value) => {
        state.setValue(field.name, value);
      });
    });

    // Ensure default value is set in state if not present
    if (state.getValue(field.name) === undefined) {
      state.setValue(field.name, field.default ?? false);
    }
  }

  getValidator(field: ToggleField): (value: unknown) => string[] {
    return (value: unknown) => {
      return this.validateRequired(field, value);
    };
  }
}

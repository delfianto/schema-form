import { Setting } from "obsidian";
import { z } from "zod";
import type { ToggleField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class ToggleFieldRenderer
  extends BaseFieldRenderer
  implements FieldRendererStrategy<ToggleField>
{
  supports(type: string): boolean {
    return type === "TOGGLE";
  }

  render(container: HTMLElement, field: ToggleField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addToggle((toggle) => {
      const currentValue = this.stateValue(field, state) as boolean | undefined;
      const booleanValue = currentValue ?? field.default ?? false;

      toggle.setValue(booleanValue).onChange((value) => {
        state.setValue(field.name, value);
      });
    });

    if (this.stateValue(field, state) === undefined) {
      state.setValue(field.name, field.default ?? false);
    }

    this.setupErrorFeedback(container, field, state, setting);
  }

  getValidator(_field: ToggleField): (value: unknown) => string[] {
    const schema = z.boolean();

    return (value: unknown) => {
      const result = schema.safeParse(value);
      if (result.success) return [];
      return result.error.issues.map((e) => e.message);
    };
  }
}

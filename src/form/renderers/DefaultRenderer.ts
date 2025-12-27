import type { Field } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class DefaultRenderer extends BaseFieldRenderer implements FieldRendererStrategy {
  supports(_type: string): boolean {
    return true; // Catch-all
  }

  render(container: HTMLElement, field: Field, _state: FormState): void {
    const el = container.createEl("div", {
      text: `Unknown field type: ${field.type} for field "${field.name}"`,
    });
    el.setAttr("style", "color: var(--text-error); font-style: italic;");
  }

  getValidator(field: Field): (value: unknown) => string[] {
    return (value: unknown) => {
      return this.validateRequired(field, value);
    };
  }
}

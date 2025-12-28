import { debounce, Setting } from "obsidian";
import type { TextField } from "../../schema/definitions";
import * as Log from "../../utils/logger";
import type { FormState } from "../FormState";
import { ValidatorBuilder } from "../validation/ValidatorBuilder";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class TextFieldRenderer
  extends BaseFieldRenderer
  implements FieldRendererStrategy<TextField>
{
  supports(type: string): boolean {
    return type === "TEXT";
  }

  render(container: HTMLElement, field: TextField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addText((text) => {
      text
        .setPlaceholder(this.placeholder(field))
        .setValue(String(this.stateValue(field, state) ?? ""))
        .onChange(
          debounce((value) => {
            state.setValue(field.name, value);
          }, 300),
        );
    });

    this.setupErrorFeedback(container, field, state, setting);
  }

  getValidator(field: TextField): (value: unknown) => string[] {
    const builder = new ValidatorBuilder();

    if (field.required) {
      builder.required();
    } else {
      builder.optional();
    }

    if (field.minLength) builder.minLength(field.minLength);
    if (field.maxLength) builder.maxLength(field.maxLength);
    if (field.regex) {
      try {
        builder.pattern(new RegExp(field.regex));
      } catch (error) {
        Log.debug(`Invalid regex "${field.regex}":`, error);
      }
    }

    return builder.build();
  }
}

import { debounce, Setting } from "obsidian";
import type { TextAreaField } from "../../schema/definitions";
import type { FormState } from "../FormState";
import { ValidatorBuilder } from "../validation/ValidatorBuilder";
import { BaseFieldRenderer, type FieldRendererStrategy } from "./types";

export class TextAreaFieldRenderer
  extends BaseFieldRenderer
  implements FieldRendererStrategy<TextAreaField>
{
  supports(type: string): boolean {
    return type === "TEXT_AREA";
  }

  render(container: HTMLElement, field: TextAreaField, state: FormState): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addTextArea((textarea) => {
      textarea
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

  getValidator(field: TextAreaField): (value: unknown) => string[] {
    const builder = new ValidatorBuilder();

    if (field.required) {
      builder.required();
    } else {
      builder.optional();
    }

    if (field.maxLength) builder.maxLength(field.maxLength);

    return builder.build();
  }
}

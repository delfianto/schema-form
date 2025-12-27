import { debounce, Setting } from "obsidian";
import { z } from "zod";
import type { TextAreaField } from "../../schema/definitions";
import type { FormState } from "../FormState";
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
    let schema: z.ZodString = z.string();

    if (!field.required) {
      schema = z.string().optional().or(z.literal("")) as unknown as z.ZodString;
    } else {
      schema = z.string().min(1, "This field is required");
    }

    if (field.maxLength) {
      schema = schema.max(field.maxLength, `Maximum length is ${field.maxLength}`);
    }

    return (value: unknown) => {
      const result = schema.safeParse(value);
      if (result.success) return [];
      return result.error.issues.map((e) => e.message);
    };
  }
}

import { debounce, Setting } from "obsidian";
import { z } from "zod";
import type { TextField } from "../../schema/definitions";
import * as Log from "../../utils/logger";
import type { FormState } from "../FormState";
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
    let schema: z.ZodString = z.string();

    if (!field.required) {
      schema = z.string().optional().or(z.literal("")) as unknown as z.ZodString;
    } else {
      schema = z.string().min(1, "This field is required");
    }

    if (field.minLength) {
      schema = schema.min(field.minLength, `Minimum length is ${field.minLength}`);
    }

    if (field.maxLength) {
      schema = schema.max(field.maxLength, `Maximum length is ${field.maxLength}`);
    }

    if (field.regex) {
      try {
        schema = schema.regex(new RegExp(field.regex), "Invalid format");
      } catch (error) {
        Log.debug(
          `TextFieldRenderer: Invalid regex "${field.regex}" for field "${field.name}":`,
          error,
        );
      }
    }

    return (value: unknown) => {
      const result = schema.safeParse(value);

      if (result.success) return [];

      return result.error.issues.map((e) => e.message);
    };
  }
}

import { z } from "zod";
import { getErrorMessages } from "../../i18n/messages";
import type { SupportedLocale } from "../../i18n/types";
import { makeOptional, makeRequired } from "./optionalSchema";

export class ValidatorBuilder {
  private schema: z.ZodTypeAny;
  private locale: SupportedLocale;

  constructor(baseSchema: z.ZodTypeAny = z.string(), locale: SupportedLocale = "en") {
    this.schema = baseSchema;
    this.locale = locale;
  }

  required(message?: string): this {
    const messages = getErrorMessages(this.locale);
    this.schema = makeRequired(this.schema, message ?? messages.required);
    return this;
  }

  optional(): this {
    this.schema = makeOptional(this.schema);
    return this;
  }

  minLength(length: number, message?: string): this {
    if (this.schema instanceof z.ZodString) {
      const messages = getErrorMessages(this.locale);
      this.schema = this.schema.min(length, message ?? messages.minLength(length));
    }
    return this;
  }

  maxLength(length: number, message?: string): this {
    if (this.schema instanceof z.ZodString) {
      const messages = getErrorMessages(this.locale);
      this.schema = this.schema.max(length, message ?? messages.maxLength(length));
    }
    return this;
  }

  minValue(min: number, message?: string): this {
    if (this.schema instanceof z.ZodNumber) {
      const messages = getErrorMessages(this.locale);
      this.schema = this.schema.min(min, message ?? messages.minValue(min));
    }
    return this;
  }

  maxValue(max: number, message?: string): this {
    if (this.schema instanceof z.ZodNumber) {
      const messages = getErrorMessages(this.locale);
      this.schema = this.schema.max(max, message ?? messages.maxValue(max));
    }
    return this;
  }

  pattern(regex: RegExp, message?: string): this {
    if (this.schema instanceof z.ZodString) {
      const messages = getErrorMessages(this.locale);
      this.schema = this.schema.regex(regex, message ?? messages.pattern);
    }
    return this;
  }

  build(): (value: unknown) => string[] {
    return (value: unknown) => {
      const result = this.schema.safeParse(value);
      if (result.success) return [];
      return result.error.issues.map((e) => e.message);
    };
  }
}

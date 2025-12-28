import { z } from "zod";
import { makeOptional, makeRequired } from "./optionalSchema";

export class ValidatorBuilder {
  private schema: z.ZodTypeAny;

  constructor(baseSchema: z.ZodTypeAny = z.string()) {
    this.schema = baseSchema;
  }

  required(message = "This field is required"): this {
    this.schema = makeRequired(this.schema, message);
    return this;
  }

  optional(): this {
    this.schema = makeOptional(this.schema);
    return this;
  }

  minLength(length: number, message?: string): this {
    if (this.schema instanceof z.ZodString) {
      this.schema = this.schema.min(length, message ?? `Minimum length is ${length}`);
    }
    return this;
  }

  maxLength(length: number, message?: string): this {
    if (this.schema instanceof z.ZodString) {
      this.schema = this.schema.max(length, message ?? `Maximum length is ${length}`);
    }
    return this;
  }

  pattern(regex: RegExp, message = "Invalid format"): this {
    if (this.schema instanceof z.ZodString) {
      this.schema = this.schema.regex(regex, message);
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

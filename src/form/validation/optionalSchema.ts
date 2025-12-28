import { z } from "zod";

/**
 * Wraps a schema to make it optional, accepting empty strings and null.
 */
export function makeOptional<T extends z.ZodTypeAny>(schema: T): z.ZodTypeAny {
  return schema.optional().or(z.literal("")).or(z.null());
}

/**
 * Wraps a schema to make it required with a custom message.
 */
export function makeRequired<T extends z.ZodTypeAny>(
  schema: T,
  message = "This field is required",
): z.ZodTypeAny {
  if (schema instanceof z.ZodString) {
    return schema.min(1, message);
  }
  return schema.refine((val) => val !== undefined && val !== null && val !== "", { message });
}

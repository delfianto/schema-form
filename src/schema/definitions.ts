import { z } from "zod";

/**
 * Zod schema for the base properties shared by all field types.
 */
const BaseField = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
});

/**
 * Zod schema for a standard text input field.
 */
export const TextField = BaseField.extend({
  type: z.literal("TEXT"),
  regex: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  placeholder: z.string().optional(),
});

/**
 * Zod schema for a multi-line text area field.
 */
export const TextAreaField = BaseField.extend({
  type: z.literal("TEXT_AREA"),
  rows: z.number().optional(),
  maxLength: z.number().optional(),
  placeholder: z.string().optional(),
});

/**
 * Zod schema for a numeric input field.
 */
export const NumberField = BaseField.extend({
  type: z.literal("NUMBER"),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  placeholder: z.string().optional(),
});

/**
 * Zod schema for a toggle (boolean) field.
 */
export const ToggleField = BaseField.extend({
  type: z.literal("TOGGLE"),
  default: z.boolean().optional(),
});

/**
 * Zod schema for an option within a select or multi-select field.
 */
export const SelectOptionSchema = z.union([
  z.string(),
  z.object({
    value: z.string(),
    label: z.string(),
  }),
]);

/**
 * Zod schema for a single-choice select field.
 */
export const SelectField = BaseField.extend({
  type: z.literal("SELECT"),
  options: z.array(SelectOptionSchema).min(1, "Select options cannot be empty"),
});

/**
 * Zod schema for a multiple-choice select field.
 */
export const MultiSelectField = SelectField.extend({
  type: z.literal("MULTI_SELECT"),
  maxSelections: z.number().optional(),
});

/**
 * Zod schema for a date input field.
 */
export const DateField = BaseField.extend({
  type: z.literal("DATE"),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  format: z.string().optional(),
});

/**
 * Discriminated union of all supported field schemas.
 * Uses the 'type' property as the discriminator.
 */
export const FieldSchema = z.discriminatedUnion("type", [
  TextField,
  TextAreaField,
  NumberField,
  ToggleField,
  SelectField,
  MultiSelectField,
  DateField,
]);

/**
 * Zod schema for the entire form definition.
 */
export const FormSchema = z.object({
  fields: z.array(FieldSchema).min(1, "Schema must have at least one field"),
});

// --- Type Inference ---

/** Represents any valid field definition. */
export type Field = z.infer<typeof FieldSchema>;

/** Represents a complete form schema definition. */
export type Schema = z.infer<typeof FormSchema>;

// Export specific field types for convenience
export type TextField = z.infer<typeof TextField>;
export type TextAreaField = z.infer<typeof TextAreaField>;
export type NumberField = z.infer<typeof NumberField>;
export type ToggleField = z.infer<typeof ToggleField>;
export type SelectField = z.infer<typeof SelectField>;
export type MultiSelectField = z.infer<typeof MultiSelectField>;
export type DateField = z.infer<typeof DateField>;
export type SelectOption = z.infer<typeof SelectOptionSchema>;

import { z } from "zod";

const BaseField = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
});

export const TextField = BaseField.extend({
  type: z.literal("TEXT"),
  regex: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  placeholder: z.string().optional(),
  default: z.string().optional(),
});

export const TextAreaField = BaseField.extend({
  type: z.literal("TEXT_AREA"),
  rows: z.number().optional(),
  maxLength: z.number().optional(),
  placeholder: z.string().optional(),
  default: z.string().optional(),
});

export const NumberField = BaseField.extend({
  type: z.literal("NUMBER"),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  placeholder: z.string().optional(),
  default: z.number().optional(),
});

export const ToggleField = BaseField.extend({
  type: z.literal("TOGGLE"),
  default: z.boolean().optional(),
});

export const SelectOptionSchema = z.union([
  z.string(),
  z.object({
    value: z.string(),
    label: z.string(),
  }),
]);

export const SelectField = BaseField.extend({
  type: z.literal("SELECT"),
  options: z.array(SelectOptionSchema).min(1, "Select options cannot be empty"),
  default: z.string().optional(),
});

export const MultiSelectField = SelectField.extend({
  type: z.literal("MULTI_SELECT"),
  maxSelections: z.number().optional(),
  default: z.array(z.string()).optional(),
});

export const DateField = BaseField.extend({
  type: z.literal("DATE"),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  format: z.string().optional(),
  default: z.string().optional(),
});

export const FieldSchema = z.discriminatedUnion("type", [
  TextField,
  TextAreaField,
  NumberField,
  ToggleField,
  SelectField,
  MultiSelectField,
  DateField,
]);

export const FormSchema = z.object({
  fields: z.array(FieldSchema).min(1, "Schema must have at least one field"),
});

export type Field = z.infer<typeof FieldSchema>;

export type Schema = z.infer<typeof FormSchema>;

export type TextField = z.infer<typeof TextField>;
export type TextAreaField = z.infer<typeof TextAreaField>;
export type NumberField = z.infer<typeof NumberField>;
export type ToggleField = z.infer<typeof ToggleField>;
export type SelectField = z.infer<typeof SelectField>;
export type MultiSelectField = z.infer<typeof MultiSelectField>;
export type DateField = z.infer<typeof DateField>;
export type SelectOption = z.infer<typeof SelectOptionSchema>;

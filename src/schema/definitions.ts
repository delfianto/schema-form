export type Field =
  | TextField
  | TextAreaField
  | NumberField
  | ToggleField
  | SelectField
  | MultiSelectField
  | DateField;

export interface BaseField {
  readonly name: string;
  readonly label: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly default?: unknown;
}

export interface TextField extends BaseField {
  readonly type: "TEXT";
  readonly regex?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
}

export interface TextAreaField extends BaseField {
  readonly type: "TEXT_AREA";
  readonly rows?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
}

export interface NumberField extends BaseField {
  readonly type: "NUMBER";
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly placeholder?: string;
}

export interface ToggleField extends BaseField {
  readonly type: "TOGGLE";
  readonly default?: boolean;
}

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectField extends BaseField {
  readonly type: "SELECT";
  readonly options: readonly (string | SelectOption)[];
}

export interface MultiSelectField extends BaseField {
  readonly type: "MULTI_SELECT";
  readonly options: readonly (string | SelectOption)[];
  readonly maxSelections?: number;
}

export interface DateField extends BaseField {
  readonly type: "DATE";
  readonly minDate?: string;
  readonly maxDate?: string;
  readonly format?: string;
}

export interface Schema {
  readonly fields: readonly Field[];
}

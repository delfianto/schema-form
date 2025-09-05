export type FieldType =
	| "TEXT"
	| "TEXT_AREA"
	| "NUMBER"
	| "TOGGLE"
	| "SELECT"
	| "MULTI_SELECT"
	| "DATE";

export interface ValidationRule {
	type: "regex" | "minLength" | "maxLength" | "min" | "max" | "custom";
	value?: unknown;
	message?: string;
}

export interface BaseField {
	name: string;
	label: string;
	description?: string;
	required?: boolean;
	default?: unknown;
	validators?: ValidationRule[];
}

export interface TextField extends BaseField {
	type: "TEXT";
	regex?: string;
	minLength?: number;
	maxLength?: number;
}

export interface TextAreaField extends BaseField {
	type: "TEXT_AREA";
	rows?: number;
	maxLength?: number;
}

export interface NumberField extends BaseField {
	type: "NUMBER";
	min?: number;
	max?: number;
	step?: number;
}

export interface ToggleField extends BaseField {
	type: "TOGGLE";
	default?: boolean;
}

export interface SelectField extends BaseField {
	type: "SELECT";
	options: string[] | { value: string; label: string }[];
}

export interface MultiSelectField extends BaseField {
	type: "MULTI_SELECT";
	options: string[] | { value: string; label: string }[];
	maxSelections?: number;
}

export interface DateField extends BaseField {
	type: "DATE";
	minDate?: string;
	maxDate?: string;
	format?: string;
}

export type Field =
	| TextField
	| TextAreaField
	| NumberField
	| ToggleField
	| SelectField
	| MultiSelectField
	| DateField;

export interface Schema {
	fields: Field[];
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	return String(error);
}

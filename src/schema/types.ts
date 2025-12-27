export type FieldType =
  | "TEXT"
  | "TEXT_AREA"
  | "NUMBER"
  | "TOGGLE"
  | "SELECT"
  | "MULTI_SELECT"
  | "DATE";

export type FieldTypeMap = {
  TEXT: string;
  TEXT_AREA: string;
  TOGGLE: boolean;
  NUMBER: number;
  SELECT: string;
  MULTI_SELECT: string[];
  DATE: Date;
};

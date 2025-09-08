import type { TFile } from "obsidian";
import type { Result } from "../utils/result";
import type { SchemaError } from "./error";
import type { Schema } from "./schema";

export type FieldType =
  | "TEXT"
  | "TEXT_AREA"
  | "NUMBER"
  | "TOGGLE"
  | "SELECT"
  | "MULTI_SELECT"
  | "DATE"
  | "DATETIME";

export type FieldTypeMap = {
  TEXT: string;
  TEXT_AREA: string;
  TOGGLE: boolean;
  NUMBER: number;
  SELECT: string;
  MULTI_SELECT: string[];
  DATE: Date;
  DATETIME: Date;
};

export type ParseResult = Result<
  {
    file: string;
    schema: Schema;
  },
  SchemaError
>;

export type PathResult = Result<
  {
    files: TFile[];
  },
  SchemaError
>;

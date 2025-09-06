import type { TFile } from "obsidian";
import type { Result } from "../utils/result";
import type { Schema } from "./schema";

export const LoaderErrType = {
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_NOT_MARKDOWN: "FILE_NOT_MARKDOWN",
  FOLDER_PATH_UNDEFINED: "FOLDER_PATH_UNDEFINED",
  INVALID_SCHEMA_FOLDER: "INVALID_SCHEMA_FOLDER",
  INVALID_SCHEMA_FORMAT: "INVALID_SCHEMA_FORMAT",
  YAML_PARSE_ERROR: "YAML_PARSE_ERROR",
} as const;

export type LoaderErrType = (typeof LoaderErrType)[keyof typeof LoaderErrType];

export const LoaderErr = {
  // Get all possible values
  values: () => Object.values(LoaderErrType),

  // Check if a string is a valid error type
  isValid: (value: string): value is LoaderErrType => {
    return Object.values(LoaderErrType).includes(value as LoaderErrType);
  },

  // Get human-readable message
  getMessage: (errorType: LoaderErrType): string => {
    switch (errorType) {
      case LoaderErrType.FILE_NOT_FOUND:
        return "The specified file could not be found";
      case LoaderErrType.FILE_NOT_MARKDOWN:
        return "File must be a markdown file";
      case LoaderErrType.FOLDER_PATH_UNDEFINED:
        return "Folder path has not been configured";
      case LoaderErrType.INVALID_SCHEMA_FOLDER:
        return "The schema folder is invalid";
      case LoaderErrType.INVALID_SCHEMA_FORMAT:
        return "The schema format is not valid";
      case LoaderErrType.YAML_PARSE_ERROR:
        return "Unable to parse JSON or YAML data";
    }
  },
};

export type FileErrType =
  | "SCHEMA_PATH_UNDEFINED"
  | "SCHEMA_PATH_NOT_EXIST"
  | "SCHEMA_PATH_IS_EMPTY";

export type LoaderResult = Result<
  {
    file: string;
    schemas: Schema;
  },
  LoaderErrType
>;

export type FileResult = Result<
  {
    files: TFile[];
  },
  FileErrType
>;

export enum ErrorCode {
  FILE_MISSING_SCHEMA = "FILE_MISSING_SCHEMA",
  FILE_FORMAT_INVALID = "FILE_FORMAT_INVALID",
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  SCHEMA_PATH_EMPTY = "SCHEMA_PATH_EMPTY",
  SCHEMA_PATH_INVALID = "SCHEMA_PATH_INVALID",
  SCHEMA_PATH_UNDEFINED = "SCHEMA_PATH_UNDEFINED",
  SCHEMA_VALIDATION_ERROR = "SCHEMA_VALIDATION_ERROR",
  SCHEMA_JSON_ERROR = "SCHEMA_JSON_ERROR",
  SCHEMA_YAML_ERROR = "SCHEMA_YAML_ERROR",
}

const DEFAULT_ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.FILE_MISSING_SCHEMA]: "Schema file is missing or empty",
  [ErrorCode.FILE_FORMAT_INVALID]: "File format is invalid",
  [ErrorCode.FILE_NOT_FOUND]: "File not found",
  [ErrorCode.SCHEMA_PATH_EMPTY]: "Schema path does not contain any valid file",
  [ErrorCode.SCHEMA_PATH_INVALID]: "Schema path does not exist",
  [ErrorCode.SCHEMA_PATH_UNDEFINED]: "Schema path is undefined",
  [ErrorCode.SCHEMA_VALIDATION_ERROR]: "Schema validation failed",
  [ErrorCode.SCHEMA_JSON_ERROR]: "JSON parsing error in schema",
  [ErrorCode.SCHEMA_YAML_ERROR]: "YAML parsing error in schema",
};

export class SchemaError extends Error {
  public readonly code: ErrorCode;
  public readonly path?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    options?: {
      path?: string;
      message?: string,
      cause?: Error;
      details?: Record<string, unknown>;
    }
  ) {
    const errorMessage = options?.message ||
      DEFAULT_ERROR_MESSAGES[code] ||
      "An unknown schema error occurred";

    super(errorMessage, { cause: options?.cause });
    this.name = "SchemaError";
    this.code = code;
    this.path = options?.path ?? "";
    this.details = options?.details ?? {};

    Object.setPrototypeOf(this, SchemaError.prototype);
  }
}

export class YamlParseError extends SchemaError {
  constructor(options?: { path?: string; message?: string, cause?: Error }) {
    super(ErrorCode.SCHEMA_YAML_ERROR, options);
    this.name = "YamlParseError";
    Object.setPrototypeOf(this, YamlParseError.prototype);
  }
}

export class ValidationError extends SchemaError {
  constructor(
    options?: {
      path?: string;
      field?: string;
      value?: unknown;
      message?: string,
      cause?: Error;
    }
  ) {
    super(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      ...options,
      details: {
        field: options?.field,
        value: options?.value,
      },
    });
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

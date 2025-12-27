import * as yaml from "js-yaml";
import { type App, TFile, TFolder } from "obsidian";
import { assertIsError } from "../utils/quirks";
import type { Schema } from "./definitions";
import { ErrorCode, SchemaError } from "./error";

function isValidSchema(value: unknown): value is Schema {
  if (!value || typeof value !== "object") {
    throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      message: "Schema must be a valid object",
    });
  }

  const schema = value as Record<string, unknown>;

  if (!schema.fields) {
    throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      message: "Schema is missing required 'fields' property",
    });
  }

  if (!Array.isArray(schema.fields)) {
    throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      message: `Schema 'fields' must be an array, but got ${typeof schema.fields}`,
    });
  }

  if (schema.fields.length === 0) {
    throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      message: "Schema 'fields' array is empty - at least one field is required",
    });
  }

  // Validate each field
  for (let i = 0; i < schema.fields.length; i++) {
    const field = schema.fields[i];

    if (!field || typeof field !== "object") {
      throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
        message: `Field at index ${i} is not a valid object`,
      });
    }

    const f = field as Record<string, unknown>;

    if (typeof f.name !== "string") {
      throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
        message: `Field at index ${i} is missing required 'name' property (string)`,
        details: { field: f },
      });
    }

    if (typeof f.type !== "string") {
      throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
        message: `Field '${f.name}' at index ${i} is missing required 'type' property (string)`,
        details: { field: f },
      });
    }

    if (f.label !== undefined && typeof f.label !== "string") {
      throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
        message: `Field '${f.name}' at index ${i} has invalid 'label' property (must be string or undefined, got ${typeof f.label})`,
        details: { field: f },
      });
    }
  }

  return true;
}

function parseSchema(lang: string, code: string): Schema {
  let parsed: unknown;

  // Parse YAML or JSON
  try {
    if (lang.toLowerCase() === "yaml" || lang.toLowerCase() === "yml") {
      parsed = yaml.load(code);
    } else if (lang.toLowerCase() === "json") {
      parsed = JSON.parse(code);
    } else {
      throw new SchemaError(ErrorCode.FILE_FORMAT_INVALID, {
        message: `Unsupported code block language '${lang}'. Expected 'yaml', 'yml', or 'json'`,
      });
    }
  } catch (error) {
    assertIsError(error);

    // If it's already a SchemaError, re-throw it
    if (error instanceof SchemaError) {
      throw error;
    }

    // Otherwise, wrap the parse error
    const isYaml = lang.toLowerCase() === "yaml" || lang.toLowerCase() === "yml";
    throw new SchemaError(isYaml ? ErrorCode.SCHEMA_YAML_ERROR : ErrorCode.SCHEMA_JSON_ERROR, {
      message: `Failed to parse ${isYaml ? "YAML" : "JSON"}: ${error.message}`,
      cause: error,
    });
  }

  // Validate the parsed schema structure
  isValidSchema(parsed);

  return parsed as Schema;
}

function readCodeBlock(content: string): { lang: string; code: string } | null {
  const match = content.match(/```(\w+)?\n([\s\S]*?)```/);
  if (!match) return null;
  return {
    lang: match[1] || "",
    code: match[2].trim(),
  };
}

export async function loadSchema(app: App, file: TFile): Promise<Schema> {
  try {
    const contents = await app.vault.read(file);
    const block = readCodeBlock(contents);

    if (!block) {
      throw new SchemaError(ErrorCode.FILE_MISSING_SCHEMA, {
        message: `No code block found in '${file.basename}'. Schema files must contain a \`\`\`yaml or \`\`\`json code block with the schema definition.`,
        path: file.path,
      });
    }

    return parseSchema(block.lang, block.code);
  } catch (error) {
    if (error instanceof SchemaError) {
      // Add file path context if not already set
      if (!error.path) {
        const options: {
          message: string;
          path: string;
          details?: Record<string, unknown>;
          cause?: Error;
        } = {
          message: error.message,
          path: file.path,
        };

        if (error.details) {
          options.details = error.details;
        }

        if (error.cause) {
          options.cause = error.cause as Error;
        }

        throw new SchemaError(error.code, options);
      }
      throw error;
    }
    assertIsError(error);
    throw new SchemaError(ErrorCode.SCHEMA_YAML_ERROR, {
      message: `Unexpected error loading schema from '${file.basename}': ${error.message}`,
      cause: error,
      path: file.path,
    });
  }
}

export async function listFiles(app: App, schemaPath: string): Promise<TFile[]> {
  if (!schemaPath.trim()) {
    throw new SchemaError(ErrorCode.SCHEMA_PATH_UNDEFINED);
  }

  const folder = app.vault.getAbstractFileByPath(schemaPath);
  if (!(folder instanceof TFolder)) {
    throw new SchemaError(ErrorCode.SCHEMA_PATH_INVALID);
  }

  const schemaFiles = folder.children.filter(
    (f) => f instanceof TFile && f.extension === "md"
  ) as TFile[];

  if (schemaFiles.length === 0) {
    throw new SchemaError(ErrorCode.SCHEMA_PATH_EMPTY);
  }

  return schemaFiles;
}

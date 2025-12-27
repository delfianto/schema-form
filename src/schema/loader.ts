import * as yaml from "js-yaml";
import { type App, TFile, TFolder } from "obsidian";
import * as Log from "../utils/logger";
import { assertIsError } from "../utils/quirks";
import { FormSchema, type Schema } from "./definitions";
import { ErrorCode, SchemaError } from "./error";

function parseSchema(lang: string, code: string): Schema {
  let parsed: unknown;

  try {
    const language = lang.toLowerCase();
    if (language === "yaml" || language === "yml") {
      parsed = yaml.load(code);
    } else if (language === "json") {
      parsed = JSON.parse(code);
    } else {
      throw new SchemaError(ErrorCode.FILE_FORMAT_INVALID, {
        message: `Unsupported code block language '${lang}'. Expected 'yaml', 'yml', or 'json'`,
      });
    }
  } catch (error) {
    assertIsError(error);

    if (error instanceof SchemaError) {
      throw error;
    }

    const isYaml = lang.toLowerCase() === "yaml" || lang.toLowerCase() === "yml";
    throw new SchemaError(isYaml ? ErrorCode.SCHEMA_YAML_ERROR : ErrorCode.SCHEMA_JSON_ERROR, {
      message: `Failed to parse ${isYaml ? "YAML" : "JSON"}: ${error.message}`,
      cause: error,
    });
  }

  const result = FormSchema.safeParse(parsed);

  if (!result.success) {
    const errorMessage = result.error.issues
      .map((e) => {
        const path = e.path.join(".");
        return path ? `${path}: ${e.message}` : e.message;
      })
      .join("; ");

    throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      message: `Validation failed: ${errorMessage}`,
      details: { errors: result.error.issues },
    });
  }

  return result.data;
}

function readCodeBlock(content: string): { lang: string; code: string } | null {
  const match = content.match(/```(\w+)?\n([\s\S]*?)```/);
  if (!match) return null;
  const lang = match[1] || "";
  const code = match[2] || "";
  return {
    lang,
    code: code.trim(),
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

/**
 * Loads a schema with an optional fallback schema in case of failure.
 */
export async function loadSchemaWithFallback(
  app: App,
  file: TFile,
  options?: { fallbackSchema?: Schema },
): Promise<Schema> {
  try {
    return await loadSchema(app, file);
  } catch (error) {
    assertIsError(error);
    Log.warn(`Failed to load schema from '${file.path}': ${error.message}`);

    if (options?.fallbackSchema) {
      return options.fallbackSchema;
    }

    throw error;
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
    (f) => f instanceof TFile && f.extension === "md",
  ) as TFile[];

  if (schemaFiles.length === 0) {
    throw new SchemaError(ErrorCode.SCHEMA_PATH_EMPTY);
  }

  return schemaFiles;
}

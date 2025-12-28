import { type App, TFile, TFolder } from "obsidian";
import * as Log from "../utils/logger";
import { assertIsError } from "../utils/quirks";
import type { Schema } from "./definitions";
import { ErrorCode, SchemaError } from "./error";
import { parseSchema } from "./parser";

/**
 * Legacy function: Load schema from a TFile
 * @deprecated Use SchemaLoader class for i18n support
 */
export async function loadSchema(app: App, file: TFile): Promise<Schema> {
  const contents = await app.vault.read(file);
  return parseSchema(contents, file.path);
}

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

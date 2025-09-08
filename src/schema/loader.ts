import * as yaml from "js-yaml";
import { type App, TFile, TFolder } from "obsidian";
import { assertIsError } from "../utils/quirks";
import { ErrorCode, SchemaError } from "./error";
import type { Schema } from "./schema";

function parseSchema(lang: string, code: string): Schema {
  let parsed: unknown;

  if (lang.toLowerCase() === "yaml" || lang.toLowerCase() === "yml") {
    parsed = yaml.load(code);
  } else {
    parsed = JSON.parse(code);
  }

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
      throw new SchemaError(ErrorCode.FILE_MISSING_SCHEMA);
    }

    return parseSchema(block.lang, block.code);
  } catch (error) {
    assertIsError(error);
    throw new SchemaError(ErrorCode.SCHEMA_YAML_ERROR, { cause: error });
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

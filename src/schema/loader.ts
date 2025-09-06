import * as yaml from "js-yaml";
import { App, TFile, TFolder } from "obsidian";
import { FileResult, LoaderErr, LoaderErrType, LoaderResult } from "./types";
import { ResultHelpers } from "../utils/result";
import { Schema } from "./schema";

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

function loaderError(errType: LoaderErrType, errDetails?: Error) {
  return ResultHelpers.err(errType, LoaderErr.getMessage(errType), errDetails);
}

export async function loadSchema(app: App, file: TFile): Promise<LoaderResult> {
  try {
    const contents = await app.vault.read(file);
    const block = readCodeBlock(contents);

    if (!block) {
      return loaderError(LoaderErrType.INVALID_SCHEMA_FORMAT);
    }

    const schema = parseSchema(block.lang, block.code);
    return ResultHelpers.ok({ file: file.name, schema: schema });
  } catch (error) {
    const errDetails = error instanceof Error ? error : new Error(String(error));
    return loaderError(LoaderErrType.YAML_PARSE_ERROR, errDetails);
  }
}

export async function listFiles(app: App, schemaPath: string): Promise<FileResult> {
  if (!schemaPath.trim()) {
    return ResultHelpers.err(
      "SCHEMA_PATH_UNDEFINED",
      "Please configure schema folder path in settings"
    );
  }

  const folder = app.vault.getAbstractFileByPath(schemaPath);
  if (!(folder instanceof TFolder)) {
    return ResultHelpers.err(
      "SCHEMA_PATH_NOT_EXIST",
      "Schema folder does not exist: " + schemaPath
    );
  }

  const schemaFiles = folder.children.filter(
    (f) => f instanceof TFile && f.extension === "md"
  ) as TFile[];

  if (schemaFiles.length === 0) {
    return ResultHelpers.err("SCHEMA_PATH_IS_EMPTY", "No markdown files found in schema folder");
  }

  return ResultHelpers.ok(
    { files: schemaFiles },
    schemaFiles.length === 1 ? "Single markdown file found" : "Multiple markdown files found"
  );
}

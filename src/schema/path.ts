import { type App, TFile, TFolder } from "obsidian";
import { ResultHelpers } from "../utils/result";
import type { FileResult } from "./types";

export function listFiles(app: App, schemaPath: string): FileResult {
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

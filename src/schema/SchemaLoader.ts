import { type App, Notice, TFile, TFolder } from "obsidian";
import type { SchemaResolution, SupportedLocale } from "../i18n/types";
import { ErrorCode, SchemaError } from "./error";
import { parseSchema } from "./parser";

export class SchemaLoader {
  constructor(
    private app: App,
    private schemaDir: string,
    private defaultLocale: SupportedLocale = "en",
  ) {}

  /**
   * Load schema with locale resolution
   */
  async loadSchema(schemaName: string, locale?: SupportedLocale): Promise<SchemaResolution> {
    const targetLocale = locale ?? this.defaultLocale;

    // Build search paths
    const searchPaths = this.buildSearchPaths(schemaName, targetLocale);

    // Try each path
    for (const { path, locale: pathLocale, isFallback } of searchPaths) {
      const file = this.app.vault.getAbstractFileByPath(path);

      if (file instanceof TFile) {
        const content = await this.app.vault.read(file);
        const schema = parseSchema(content, file.path);

        // Show notice if using fallback
        if (isFallback && targetLocale !== "en") {
          new Notice(
            `Schema "${schemaName}" not available in ${targetLocale}, using ${pathLocale}`,
          );
        }

        return {
          schema,
          locale: pathLocale,
          fallback: isFallback,
          path,
        };
      }
    }

    // No schema found
    throw new SchemaError(ErrorCode.FILE_MISSING_SCHEMA, {
      message: `Schema "${schemaName}" not found for locale "${targetLocale}". Searched paths: ${searchPaths.map((p) => p.path).join(", ")}`,
      path: this.schemaDir,
    });
  }

  /**
   * Build prioritized list of paths to search
   */
  private buildSearchPaths(
    schemaName: string,
    locale: SupportedLocale,
  ): Array<{ path: string; locale: SupportedLocale; isFallback: boolean }> {
    const paths: Array<{
      path: string;
      locale: SupportedLocale;
      isFallback: boolean;
    }> = [];

    // 1. Requested locale
    paths.push({
      path: `${this.schemaDir}/${schemaName}.${locale}.md`,
      locale,
      isFallback: false,
    });

    // 2. Base language (e.g., 'en' from 'en-US')
    if (locale.includes("-")) {
      const baseLocale = locale.split("-")[0] as SupportedLocale;
      paths.push({
        path: `${this.schemaDir}/${schemaName}.${baseLocale}.md`,
        locale: baseLocale,
        isFallback: true,
      });
    }

    // 3. Default locale (if not already tried)
    if (locale !== this.defaultLocale) {
      paths.push({
        path: `${this.schemaDir}/${schemaName}.${this.defaultLocale}.md`,
        locale: this.defaultLocale,
        isFallback: true,
      });
    }

    // 4. Legacy (no locale)
    paths.push({
      path: `${this.schemaDir}/${schemaName}.md`,
      locale: this.defaultLocale,
      isFallback: true,
    });

    return paths;
  }

  /**
   * List all available schemas with their locales
   */
  async listSchemas(): Promise<Map<string, SupportedLocale[]>> {
    const schemaMap = new Map<string, SupportedLocale[]>();
    const folder = this.app.vault.getAbstractFileByPath(this.schemaDir);

    if (!folder || !(folder instanceof TFolder)) {
      return schemaMap;
    }

    const files = folder.children.filter(
      (f) => f instanceof TFile && f.extension === "md",
    ) as TFile[];

    for (const file of files) {
      const match = file.basename.match(/^(.+?)(?:\.([a-z]{2}(?:-[A-Z]{2})?))?$/);

      if (match) {
        const baseName = match[1];
        const locale = match[2];

        if (!baseName) continue;

        const localeCode = (locale as SupportedLocale) ?? this.defaultLocale;

        if (!schemaMap.has(baseName)) {
          schemaMap.set(baseName, []);
        }

        const locales = schemaMap.get(baseName);
        if (locales && !locales.includes(localeCode)) {
          locales.push(localeCode);
        }
      }
    }

    return schemaMap;
  }
}

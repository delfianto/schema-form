import * as yaml from "js-yaml";
import { assertIsError } from "../utils/quirks";
import { FormSchema, type Schema } from "./definitions";
import { ErrorCode, SchemaError } from "./error";

interface CodeBlock {
  lang: string;
  code: string;
  start: number;
  end: number;
}

function findCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines = content.split("\n");
  let inBlock = false;
  let currentBlock: Partial<CodeBlock> = {};
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check for opening fence (``` or ~~~)
    const openMatch = line.match(/^(`{3,}|~{3,})(\w*)\s*$/);
    if (openMatch && !inBlock) {
      inBlock = true;
      currentBlock = {
        lang: openMatch[2] || "",
        start: i,
      };
      codeLines = [];
      continue;
    }

    // Check for closing fence
    const closeMatch = line.match(/^(`{3,}|~{3,})\s*$/);
    if (closeMatch && inBlock) {
      blocks.push({
        lang: currentBlock.lang || "",
        code: codeLines.join("\n").trim(),
        start: currentBlock.start || 0,
        end: i,
      });
      inBlock = false;
      currentBlock = {};
      codeLines = [];
      continue;
    }

    if (inBlock) {
      codeLines.push(line);
    }
  }

  return blocks;
}

function readCodeBlock(content: string): { lang: string; code: string } | null {
  const blocks = findCodeBlocks(content);

  if (blocks.length === 0) return null;

  // Find first YAML or JSON block
  const schemaBlock = blocks.find((b) => {
    const lang = b.lang.toLowerCase();
    return lang === "yaml" || lang === "yml" || lang === "json";
  });

  // If we found code blocks but none are YAML/JSON, return the first one
  // so parseSchemaFromCode can throw a proper "unsupported language" error
  if (!schemaBlock && blocks[0]) {
    return {
      lang: blocks[0].lang,
      code: blocks[0].code,
    };
  }

  if (!schemaBlock) return null;

  return {
    lang: schemaBlock.lang,
    code: schemaBlock.code,
  };
}

function parseSchemaFromCode(lang: string, code: string): Schema {
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

/**
 * Parse a schema from markdown content
 * @param content Markdown content containing a code block with schema
 * @param path Optional file path for error reporting
 */
export function parseSchema(content: string, path?: string): Schema {
  try {
    const block = readCodeBlock(content);

    if (!block) {
      throw new SchemaError(ErrorCode.FILE_MISSING_SCHEMA, {
        message: `No code block found. Schema files must contain a \`\`\`yaml or \`\`\`json code block with the schema definition.`,
        path,
      });
    }

    return parseSchemaFromCode(block.lang, block.code);
  } catch (error) {
    if (error instanceof SchemaError) {
      // Add path if not already set
      if (!error.path && path) {
        throw new SchemaError(error.code, {
          message: error.message,
          path,
          details: error.details,
          cause: error.cause as Error | undefined,
        });
      }
      throw error;
    }
    assertIsError(error);
    throw new SchemaError(ErrorCode.SCHEMA_YAML_ERROR, {
      message: `Unexpected error parsing schema: ${error.message}`,
      cause: error,
      path,
    });
  }
}

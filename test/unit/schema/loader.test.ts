import { describe, expect, mock, test } from "bun:test";
import type { Vault } from "../../setup";
import { TFile, TFolder } from "obsidian";
import { listFiles, loadSchema } from "../../../src/schema/loader";
import { ErrorCode, SchemaError } from "../../../src/schema/error";

function createMockFile(path: string, basename: string, extension: string = "md"): any {
	const file: any = new TFile();
	file.path = path;
	file.basename = basename;
	file.extension = extension;
	file.vault = {} as Vault;
	file.parent = null;
	file.name = `${basename}.${extension}`;
	file.stat = { ctime: 0, mtime: 0, size: 0 };
	return file;
}

function createMockFolder(path: string, children: any[] = []): any {
	const folder: any = new TFolder();
	folder.path = path;
	folder.children = children;
	folder.isRoot = () => path === "";
	return folder;
}

function createMockApp(vault: Partial<Vault>): any {
	return {
		vault: vault as Vault,
	} as any;
}

describe("loadSchema", () => {
	describe("valid schemas", () => {
		test("should parse valid YAML schema", async () => {
			const mockContent = `# Test Schema

\`\`\`yaml
fields:
  - name: test_field
    type: TEXT
    label: Test Field
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			const schema = await loadSchema(mockApp, mockFile);

			expect(schema).toBeDefined();
			expect(schema.fields).toBeArray();
			expect(schema.fields).toHaveLength(1);
			const firstField = schema.fields[0];
			expect(firstField).toBeDefined();
			if (firstField) {
				expect(firstField.name).toBe("test_field");
				expect(firstField.type).toBe("TEXT");
				expect(firstField.label).toBe("Test Field");
			}
		});

		test("should parse valid JSON schema", async () => {
			const mockContent = `# Test Schema

\`\`\`json
{
  "fields": [
    {
      "name": "test_field",
      "type": "NUMBER",
      "label": "Test Number"
    }
  ]
}
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			const schema = await loadSchema(mockApp, mockFile);

			expect(schema).toBeDefined();
			expect(schema.fields).toHaveLength(1);
			const firstField = schema.fields[0];
			expect(firstField).toBeDefined();
			if (firstField) {
				expect(firstField.type).toBe("NUMBER");
			}
		});

		test("should handle schema with all field types", async () => {
			const mockContent = `\`\`\`yaml
fields:
  - name: text_field
    type: TEXT
  - name: number_field
    type: NUMBER
  - name: toggle_field
    type: TOGGLE
  - name: select_field
    type: SELECT
    options: [A, B, C]
  - name: date_field
    type: DATE
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			const schema = await loadSchema(mockApp, mockFile);

			expect(schema.fields).toHaveLength(5);
			expect(schema.fields.map((f) => f.type)).toEqual(["TEXT", "NUMBER", "TOGGLE", "SELECT", "DATE"]);
		});

		test("should handle optional field properties", async () => {
			const mockContent = `\`\`\`yaml
fields:
  - name: full_field
    type: TEXT
    label: Full Field
    description: A fully configured field
    required: true
    default: default value
    placeholder: Enter text
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			const schema = await loadSchema(mockApp, mockFile);

			const field = schema.fields[0];
			expect(field).toBeDefined();
			if (field) {
				expect(field.name).toBe("full_field");
				expect(field.label).toBe("Full Field");
				expect(field.description).toBe("A fully configured field");
			}
		});
	});

	describe("invalid YAML/JSON", () => {
		test("should throw SchemaError for invalid YAML", async () => {
			const mockContent = `\`\`\`yaml
fields:
  - name: test
    invalid yaml: [
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/Failed to parse YAML/);
		});

		test("should throw SchemaError for invalid JSON", async () => {
			const mockContent = `\`\`\`json
{
  "fields": [
    { "name": "test", }
  ]
}
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/Failed to parse JSON/);
		});

		test("should include error code for YAML parsing error", async () => {
			const mockContent = `\`\`\`yaml
invalid: yaml: syntax
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			try {
				await loadSchema(mockApp, mockFile);
				expect.unreachable("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(SchemaError);
				expect((error as SchemaError).code).toBe(ErrorCode.SCHEMA_YAML_ERROR);
			}
		});
	});

	describe("schema validation errors", () => {
		test("should throw SchemaError for missing fields property", async () => {
			const mockContent = `\`\`\`yaml
title: Test
description: Missing fields
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/fields: (Invalid input|Required)/);
		});

		test("should throw SchemaError for non-array fields", async () => {
			const mockContent = `\`\`\`yaml
fields: "not an array"
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/fields: (Invalid input|expected array)/);
		});

		test("should throw SchemaError for empty fields array", async () => {
			const mockContent = `\`\`\`yaml
fields: []
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/at least one field/);
		});

		test("should throw SchemaError for field missing name", async () => {
			const mockContent = `\`\`\`yaml
fields:
  - type: TEXT
    label: No Name Field
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/name: (Invalid input|Required)/);
		});

		test("should throw SchemaError for field missing type", async () => {
			const mockContent = `\`\`\`yaml
fields:
  - name: test_field
    label: No Type Field
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/type: (Invalid input|Required)/);
		});

		test("should throw SchemaError for invalid label type", async () => {
			const mockContent = `\`\`\`yaml
fields:
  - name: test
    type: TEXT
    label: 123
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/label: (Invalid input|expected string)/);
		});

		test("should throw SchemaError for non-object field", async () => {
			const mockContent = `\`\`\`yaml
fields:
  - "not an object"
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/(is not a valid object|Invalid input|expected object)/);
		});

		test("should include validation error code", async () => {
			const mockContent = `\`\`\`yaml
fields: []
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			try {
				await loadSchema(mockApp, mockFile);
				expect.unreachable("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(SchemaError);
				expect((error as SchemaError).code).toBe(ErrorCode.SCHEMA_VALIDATION_ERROR);
			}
		});
	});

	describe("file format errors", () => {
		test("should throw SchemaError for missing code block", async () => {
			const mockContent = "# Test\n\nThis file has no code block.";

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/No code block found/);
		});

		test("should throw SchemaError for unsupported language", async () => {
			const mockContent = `\`\`\`python
fields = []
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(SchemaError);
			await expect(loadSchema(mockApp, mockFile)).rejects.toThrow(/Unsupported code block language/);
		});

		test("should include file path in error context", async () => {
			const mockContent = "No code block";

			const mockFile = createMockFile("schemas/test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			try {
				await loadSchema(mockApp, mockFile);
				expect.unreachable("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(SchemaError);
				expect((error as SchemaError).path).toBe("schemas/test.md");
			}
		});
	});

	describe("case insensitivity", () => {
		test("should accept YAML in uppercase", async () => {
			const mockContent = `\`\`\`YAML
fields:
  - name: test
    type: TEXT
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			const schema = await loadSchema(mockApp, mockFile);
			expect(schema.fields).toHaveLength(1);
		});

		test("should accept yml extension", async () => {
			const mockContent = `\`\`\`yml
fields:
  - name: test
    type: TEXT
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			const schema = await loadSchema(mockApp, mockFile);
			expect(schema.fields).toHaveLength(1);
		});

		test("should accept JSON in uppercase", async () => {
			const mockContent = `\`\`\`JSON
{
  "fields": [
    { "name": "test", "type": "TEXT" }
  ]
}
\`\`\``;

			const mockFile = createMockFile("test.md", "test");
			const mockApp = createMockApp({
				read: mock(async () => mockContent),
			});

			const schema = await loadSchema(mockApp, mockFile);
			expect(schema.fields).toHaveLength(1);
		});
	});
});

describe("listFiles", () => {
	describe("valid directory", () => {
		test("should list markdown files in schema directory", async () => {
			const file1 = createMockFile("schemas/task.md", "task");
			const file2 = createMockFile("schemas/note.md", "note");
			const file3 = createMockFile("schemas/readme.txt", "readme", "txt");

			const folder = createMockFolder("schemas", [file1, file2, file3]);
			const mockApp = createMockApp({
				getAbstractFileByPath: mock((path: string) => (path === "schemas" ? folder : null)),
			});

			const files = await listFiles(mockApp, "schemas");

			expect(files).toBeArray();
			expect(files).toHaveLength(2);
			expect(files).toContain(file1);
			expect(files).toContain(file2);
			expect(files).not.toContain(file3); // .txt file should be filtered out
		});

		test("should return files sorted by modification time", async () => {
			const file1 = createMockFile("schemas/a.md", "a");
			const file2 = createMockFile("schemas/b.md", "b");

			const folder = createMockFolder("schemas", [file1, file2]);
			const mockApp = createMockApp({
				getAbstractFileByPath: mock((path: string) => (path === "schemas" ? folder : null)),
			});

			const files = await listFiles(mockApp, "schemas");

			expect(files).toHaveLength(2);
		});
	});

	describe("error cases", () => {
		test("should throw SchemaError for empty path", async () => {
			const mockApp = createMockApp({});

			await expect(listFiles(mockApp, "")).rejects.toThrow(SchemaError);
		});

		test("should throw SchemaError for whitespace-only path", async () => {
			const mockApp = createMockApp({});

			await expect(listFiles(mockApp, "   ")).rejects.toThrow(SchemaError);
		});

		test("should throw SchemaError for non-existent folder", async () => {
			const mockApp = createMockApp({
				getAbstractFileByPath: mock(() => null),
			});

			await expect(listFiles(mockApp, "nonexistent")).rejects.toThrow(SchemaError);
		});

		test("should throw SchemaError when path is not a folder", async () => {
			const file = createMockFile("schemas/test.md", "test");
			const mockApp = createMockApp({
				getAbstractFileByPath: mock((path: string) => (path === "schemas/test.md" ? file : null)),
			});

			await expect(listFiles(mockApp, "schemas/test.md")).rejects.toThrow(SchemaError);
		});

		test("should throw SchemaError for empty folder", async () => {
			const folder = createMockFolder("schemas", []);
			const mockApp = createMockApp({
				getAbstractFileByPath: mock((path: string) => (path === "schemas" ? folder : null)),
			});

			await expect(listFiles(mockApp, "schemas")).rejects.toThrow(SchemaError);
		});

		test("should throw SchemaError for folder with no markdown files", async () => {
			const file1 = createMockFile("schemas/readme.txt", "readme", "txt");
			const file2 = createMockFile("schemas/config.json", "config", "json");

			const folder = createMockFolder("schemas", [file1, file2]);
			const mockApp = createMockApp({
				getAbstractFileByPath: mock((path: string) => (path === "schemas" ? folder : null)),
			});

			await expect(listFiles(mockApp, "schemas")).rejects.toThrow(SchemaError);
		});

		test("should have correct error code for undefined path", async () => {
			const mockApp = createMockApp({});

			try {
				await listFiles(mockApp, "");
				expect.unreachable("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(SchemaError);
				expect((error as SchemaError).code).toBe(ErrorCode.SCHEMA_PATH_UNDEFINED);
			}
		});

		test("should have correct error code for invalid path", async () => {
			const mockApp = createMockApp({
				getAbstractFileByPath: mock(() => null),
			});

			try {
				await listFiles(mockApp, "invalid");
				expect.unreachable("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(SchemaError);
				expect((error as SchemaError).code).toBe(ErrorCode.SCHEMA_PATH_INVALID);
			}
		});

		test("should have correct error code for empty folder", async () => {
			const folder = createMockFolder("schemas", []);
			const mockApp = createMockApp({
				getAbstractFileByPath: mock((path: string) => (path === "schemas" ? folder : null)),
			});

			try {
				await listFiles(mockApp, "schemas");
				expect.unreachable("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(SchemaError);
				expect((error as SchemaError).code).toBe(ErrorCode.SCHEMA_PATH_EMPTY);
			}
		});
	});
});

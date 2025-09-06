import type { App } from "obsidian";
import { SchemaErrorModal } from "../form/error-ui";
import { LoaderErrType } from "../schema/types";
import { ResultHelpers } from "../utils/result";

/**
 * Show a basic test error modal with simple stack trace
 */
const showBasicErrorModal = (app: App): void => {
  const enhancedError = new Error("Schema validation failed: Invalid property 'test_field'");
  enhancedError.stack = `Error: Schema validation failed: Invalid property 'test_field'
  at parseSchema (file:///your-plugin/loader.ts:25:15)
  at loadSchema (file:///your-plugin/loader.ts:45:23)
  at async YourPlugin.loadSchemaFile (file:///your-plugin/main.ts:123:45)
  at async YourPlugin.onload (file:///your-plugin/main.ts:67:12)
  at Object.loadPlugin (app://obsidian.md/app.js:1:234567)
  at async Object.enablePlugin (app://obsidian.md/app.js:1:234890)`;

  const testError = ResultHelpers.err(
    LoaderErrType.YAML_PARSE_ERROR,
    "Test error: Failed to parse schema file",
    enhancedError
  );

  const modal = new SchemaErrorModal(app, "test-schema.md", testError);
  modal.open();
};

/**
 * Show a realistic JSON parse error modal
 */
const showParseErrorModal = (app: App): void => {
  const parseError = new SyntaxError("Unexpected token '}' in JSON at position 156");
  parseError.stack = `SyntaxError: Unexpected token '}' in JSON at position 156
  at JSON.parse (<anonymous>)
  at parseSchema (file:///your-plugin/loader.ts:15:18)
  at readCodeBlock (file:///your-plugin/loader.ts:35:25)
  at loadSchema (file:///your-plugin/loader.ts:55:12)
  at async YourPlugin.handleSchemaLoad (file:///your-plugin/main.ts:189:23)`;

  const testError = ResultHelpers.err(
    LoaderErrType.YAML_PARSE_ERROR,
    "JSON parsing failed: Invalid syntax in schema file",
    parseError
  );

  const modal = new SchemaErrorModal(app, "broken-schema.md", testError);
  modal.open();
};

/**
 * Show a complex error with nested causes
 */
const showComplexErrorModal = (app: App): void => {
  const rootCause = new Error("Network timeout while fetching schema");
  rootCause.stack = `Error: Network timeout while fetching schema
  at fetch (app://obsidian.md/app.js:1:123456)
  at SchemaLoader.fetchRemoteSchema (file:///your-plugin/remote-loader.ts:45:67)`;

  const wrapperError = new Error("Failed to load remote schema reference");
  wrapperError.stack = `Error: Failed to load remote schema reference
  at SchemaLoader.resolveReference (file:///your-plugin/schema-resolver.ts:78:90)
  at parseSchema (file:///your-plugin/loader.ts:25:15)
  at loadSchema (file:///your-plugin/loader.ts:45:23)
  at async YourPlugin.loadSchemaFile (file:///your-plugin/main.ts:123:45)`;

  // Add the root cause to the wrapper error
  (wrapperError as any).cause = rootCause;

  const testError = ResultHelpers.err(
    LoaderErrType.INVALID_SCHEMA_FORMAT,
    "Complex error: Schema contains unresolvable references",
    wrapperError
  );

  const modal = new SchemaErrorModal(app, "complex-schema-with-refs.md", testError);
  modal.open();
};

/**
 * Show a YAML parsing error
 */
const showYamlErrorModal = (app: App): void => {
  const yamlError = new Error("Invalid YAML: Unexpected character at line 5, column 12");
  yamlError.stack = `Error: Invalid YAML: Unexpected character at line 5, column 12
  at yaml.load (file:///node_modules/js-yaml/lib/loader.js:167:13)
  at parseSchema (file:///your-plugin/loader.ts:18:20)
  at readCodeBlock (file:///your-plugin/loader.ts:38:25)
  at loadSchema (file:///your-plugin/loader.ts:58:12)`;

  const testError = ResultHelpers.err(
    LoaderErrType.YAML_PARSE_ERROR,
    "YAML parsing failed: Invalid syntax in schema file",
    yamlError
  );

  const modal = new SchemaErrorModal(app, "invalid-yaml-schema.md", testError);
  modal.open();
};

export const debugModals = {
  basicError: showBasicErrorModal,
  complexError: showComplexErrorModal,
  parseError: showParseErrorModal,
  yamlError: showYamlErrorModal,
};

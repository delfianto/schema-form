import { type App, Setting } from "obsidian";
import { DebugErrorModal, FormHandler } from "../form";
import type SchemaFormPlugin from "../main";
import { cssClass, SCHEMA_FORM_STYLE } from "../style";

export function addDebugSection(container: HTMLElement, plugin: SchemaFormPlugin): void {
  container.createEl("h2", { text: "Debug Tools" });

  new Setting(container)
    .setName("Test General Error Modal")
    .setDesc("Test the schema error modal with dummy data")
    .addButton((button) =>
      button
        .setClass(cssClass(SCHEMA_FORM_STYLE.SETTINGS_DEBUG_BTN))
        .setButtonText("Show Error")
        .setWarning()
        .onClick(() => {
          debugModals.basicError(plugin.app);
        }),
    );

  new Setting(container)
    .setName("Test Schema Parse Error Modal")
    .setDesc("Test with a realistic JSON parsing error")
    .addButton((button) =>
      button
        .setClass(cssClass(SCHEMA_FORM_STYLE.SETTINGS_DEBUG_BTN))
        .setButtonText("JSON Error")
        .setCta()
        .onClick(() => {
          debugModals.parseError(plugin.app);
        }),
    );

  new Setting(container)
    .setName("Show Complex Error Modal")
    .setDesc("Test with a complex error with nested stack traces")
    .addButton((button) =>
      button
        .setClass(cssClass(SCHEMA_FORM_STYLE.SETTINGS_DEBUG_BTN))
        .setButtonText("Complex Error")
        .setCta()
        .onClick(() => {
          debugModals.complexError(plugin.app);
        }),
    );

  new Setting(container)
    .setName("Test Schema Modal Form")
    .setDesc("Test loading schemas from the configured directory")
    .addButton((button) =>
      button
        .setClass(cssClass(SCHEMA_FORM_STYLE.SETTINGS_DEBUG_BTN))
        .setButtonText("Load Schema")
        .setCta()
        .onClick(async () => {
          const formHandler = new FormHandler(plugin, plugin.settings.schemaDir);
          const formData = await formHandler.showForm();
          console.log("Form result:", formData);
        }),
    );
}

const showBasicErrorModal = (app: App): void => {
  const basicError = new Error("Schema validation failed: Invalid property 'test_field'");
  basicError.stack = `Error: Schema validation failed: Invalid property 'test_field'
  at parseSchema (file:///your-plugin/loader.ts:25:15)
  at loadSchema (file:///your-plugin/loader.ts:45:23)
  at async YourPlugin.loadSchemaFile (file:///your-plugin/main.ts:123:45)
  at async YourPlugin.onload (file:///your-plugin/main.ts:67:12)
  at Object.loadPlugin (app://obsidian.md/app.js:1:234567)
  at async Object.enablePlugin (app://obsidian.md/app.js:1:234890)`;

  const modal = new DebugErrorModal(app, basicError, "Schema validation failed");
  modal.open();
};

const showParseErrorModal = (app: App): void => {
  const parseError = new SyntaxError("Unexpected token '}' in JSON at position 156");
  parseError.stack = `SyntaxError: Unexpected token '}' in JSON at position 156
  at JSON.parse (<anonymous>)
  at parseSchema (file:///your-plugin/loader.ts:15:18)
  at readCodeBlock (file:///your-plugin/loader.ts:35:25)
  at loadSchema (file:///your-plugin/loader.ts:55:12)
  at async YourPlugin.handleSchemaLoad (file:///your-plugin/main.ts:189:23)`;

  const modal = new DebugErrorModal(app, parseError, "Schema validation failed");
  modal.open();
};

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
  wrapperError.cause = rootCause;

  const modal = new DebugErrorModal(app, rootCause, "Schema validation failed");
  modal.open();
};

const showYamlErrorModal = (app: App): void => {
  const yamlError = new Error("Invalid YAML: Unexpected character at line 5, column 12");
  yamlError.stack = `Error: Invalid YAML: Unexpected character at line 5, column 12
  at yaml.load (file:///node_modules/js-yaml/lib/loader.js:167:13)
  at parseSchema (file:///your-plugin/loader.ts:18:20)
  at readCodeBlock (file:///your-plugin/loader.ts:38:25)
  at loadSchema (file:///your-plugin/loader.ts:58:12)`;

  const modal = new DebugErrorModal(app, yamlError, "Schema validation failed");
  modal.open();
};

export const debugModals = {
  basicError: showBasicErrorModal,
  complexError: showComplexErrorModal,
  parseError: showParseErrorModal,
  yamlError: showYamlErrorModal,
};

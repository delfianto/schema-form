# Project Implementation Guidelines: Schema Form Plugin

## 1. Project Overview

**Schema Form** is an Obsidian plugin that generates modal forms dynamically based on schema definitions (JSON/YAML) stored in Markdown files. It allows users to capture structured data which is then returned to the caller or saved.

### Tech Stack

- **Runtime/Package Manager:** [Bun](https://bun.sh) (v1.x)
- **Bundler:** `esbuild`
- **Language:** TypeScript (ES2022 target)
- **Linting/Formatting:** Biome
- **Testing:** Bun Test
- **Framework:** Obsidian API

---

## 2. Architecture & Core Concepts

### 2.1. Data Flow

1.  **Trigger:** User invokes the form via Command Palette or External API (`window.scf`).
2.  **Selection:** `FormHandler` lists files in the configured `schemaDir`. If multiple exist, `FileSelectorModal` prompts the user.
3.  **Loading:** `SchemaLoader` reads the selected file, extracting JSON/YAML code blocks to parse into a `Schema` object.
4.  **Rendering:** `SchemaFormModal` initializes `FormState` and delegates rendering to `FormRenderer`.
5.  **Interaction:** User input updates `FormState`.
6.  **Submission:** On submit, data is validated and passed back via the `onSubmit` callback.

### 2.2. Directory Structure (`src/`)

- **`main.ts`**: Plugin entry point. Handles lifecycle and global settings.
- **`api.ts`**: Exposes the global `window.scf` API for external integration.
- **`form/`**: UI logic.
  - `form-handler.ts`: Orchestrates file selection and modal opening.
  - `form-renderer.ts`: Maps schema fields to DOM elements (Obsidian `Setting` API).
  - `form-state.ts`: Manages form data, labels, and reactivity (listeners).
  - `schema-ui.ts`: The actual Modal container for the form.
  - `tree-renderer.ts`: Utility for rendering object trees (used in debug/error views).
- **`schema/`**: Data definitions.
  - `schema.ts`: TypeScript interfaces for Field types (Text, Number, Date, etc.).
  - `loader.ts`: Logic to parse YAML/JSON from Markdown code blocks.
  - `error.ts`: Custom error classes (`SchemaError`, `ValidationError`).
- **`settings/`**: Plugin settings tab and configuration logic.
- **`style/`**: CSS class constant definitions to ensure consistency.
- **`utils/`**: Helpers for logging, result types, and type assertions.

---

## 3. Implementation Guidelines

### 3.1. Adding a New Field Type

To add a new field type (e.g., `ColorPicker`), follow this strict propagation path:

1.  **Define Interface (`src/schema/schema.ts`):**
    Create a new interface extending `BaseField`.

    ```typescript
    export interface ColorField extends BaseField {
      readonly type: "COLOR";
      readonly default?: string;
    }
    // Add to Field union type
    export type Field = ... | ColorField;
    ```

2.  **Update Type Maps (`src/schema/types.ts`):**
    Register the mapping between the string type and the runtime value type.

    ```typescript
    export type FieldType = ... | "COLOR";
    export type FieldTypeMap = {
      // ...
      COLOR: string;
    };
    ```

3.  **Implement Renderer (`src/form/form-renderer.ts`):**
    Add a render method and update the `switch` statement in `renderField`.

    ```typescript
    private renderColorField(container: HTMLElement, field: ColorField): void {
      const setting = new Setting(container)
        .setName(this.label(field))
        .setDesc(this.desc(field));

      setting.addColorPicker((color) => {
        color.setValue(this.stateValue(field))
             .onChange((value) => this.state.setValue(field.name, value));
      });
    }
    ```

### 3.2. Error Handling

- **Do not throw generic Errors.** Use `SchemaError` or `FormError` from `src/schema/error.ts`.
- **ErrorCode Enum:** Always add a new entry to `ErrorCode` in `error.ts` when introducing a new category of failure.
- **Quirks:** Use `assertIsError(err)` from `src/utils/quirks.ts` in catch blocks to satisfy TypeScript's strict `unknown` error type.
  ```typescript
  try {
    // logic
  } catch (error) {
    assertIsError(error);
    throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, { cause: error });
  }
  ```

### 3.3. State Management

- **Reactive Updates:** Do not manually manipulate DOM values after initial render. Update the `FormState` via `state.setValue()`.
- **Listeners:** Components that need to react to changes should subscribe via `state.onFieldChange()`.

### 3.4. CSS and Styling

- **No Magic Strings:** Never use raw string literals for class names. Define them in `src/style/style.ts`.
- **Prefixing:** All classes are automatically prefixed with `scmf-` via the `cssClass` helper.
  ```typescript
  // Usage
  element.addClass(cssClass(SCHEMA_FORM_STYLE.ERROR_STACKTRACE));
  ```
- **Variables:** Use Obsidian's CSS variables (`--text-normal`, `--background-primary`) for theme compatibility.

### 3.5. Logging

- Use the wrapper in `src/utils/logger.ts`.
- **Debug Logs:** `Log.debug()` only outputs if `debugFlag` is enabled in settings.
- **Emojis:** The logger automatically prepends emojis (ℹ️, ⚠️, 💀, 🤖) for visual parsing in the console.

---

## 4. Development Workflow

### 4.1. Setup

```bash
npm install -g bun
bun install
```

### 4.2. Build & Watch

- **Development:** `bun run dev` (Runs esbuild in watch mode with inline sourcemaps).
- **Production:** `bun run build` (Minifies and removes sourcemaps).

### 4.3. Code Quality

- **Lint/Format:** The project uses `Biome` instead of ESLint/Prettier.

```bash
bun run check      # Check for errors
bun run check:fix  # Fix auto-fixable errors
bun run format     # Format code

```

- **Testing:**

```bash
bun test

```

### 4.4. Versioning

- Use the helper script to bump versions across `manifest.json`, `package.json`, and `versions.json`:

```bash
npm version patch # or minor/major

```

_Note: This triggers `version-bump.mjs`._

---

## 5. API Integration (External Use)

The plugin exposes a global API on `window.scf`.

**Interface (`SCFApi`):**

- `triggerForm(schemaName?: string)`: Opens the form.
- `value(fieldName: string)`: Gets the last submitted value.
- `reset()`: Clears internal data.

**Example Usage in DataviewJS:**

```javascript
const api = window.scf;
if (api) {
  const result = await api.triggerForm(); // Triggers UI flow
  console.log("Form Data:", result);
}
```

---

## 6. Known Technical Debt & TODOs

1. **Multi-Select:** `MULTI_SELECT` field type is defined in Schema but implementation in `form-renderer.ts` is missing (currently commented out).
2. **Result Pattern:** The `src/utils/result.ts` file implements a Rust-like Result pattern, but it is not consistently used across the codebase. Refactoring should either adopt this fully or remove it in favor of standard try/catch flow.
3. **CSS Separation:** Some styles are inline or in `styles.css`. Moving forward, complex component styles should move to `styles.css` using the class constants defined in `style.ts`.

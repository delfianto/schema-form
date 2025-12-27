This is a "Principal Engineer" level refactoring plan designed to move your Obsidian plugin from "brittle prototype" to **"Production-Grade TypeScript."**

Since you are using **Bun** and **Biome**, this plan is optimized for that stack (fast builds, strict linting).

### Phase 1: The "Zod" Foundation (Kill `loader.ts`)

**Goal:** Delete the brittle `isValidSchema` function and replace it with strict, type-inferred validation. This prevents runtime crashes due to bad user configs.

**1. Install Zod:**

```bash
bun add zod

```

**2. Create `src/schema/definitions.ts`:**
This replaces your manual interfaces with Zod schemas. TypeScript types are automatically derived.

```typescript
import { z } from "zod";

// --- Base Field ---
const BaseField = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
});

// --- Specific Fields ---
export const TextField = BaseField.extend({
  type: z.literal("TEXT"),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  regex: z.string().optional(),
  placeholder: z.string().optional(),
});

export const NumberField = BaseField.extend({
  type: z.literal("NUMBER"),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const ToggleField = BaseField.extend({
  type: z.literal("TOGGLE"),
});

export const SelectField = BaseField.extend({
  type: z.literal("SELECT"),
  options: z
    .array(
      z.union([z.string(), z.object({ value: z.string(), label: z.string() })]),
    )
    .min(1, "Select options cannot be empty"),
});

export const MultiSelectField = SelectField.extend({
  type: z.literal("MULTI_SELECT"),
});

export const DateField = BaseField.extend({
  type: z.literal("DATE"),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
});

// --- Discriminated Union ---
export const FieldSchema = z.discriminator("type", [
  TextField,
  NumberField,
  ToggleField,
  SelectField,
  MultiSelectField,
  DateField,
]);

export const SchemaSchema = z.object({
  fields: z.array(FieldSchema),
});

// --- Type Inference ---
export type Field = z.infer<typeof FieldSchema>;
export type Schema = z.infer<typeof SchemaSchema>;
```

**3. Rewrite `src/schema/loader.ts`:**
Now the loader is purely a parser.

```typescript
import { SchemaSchema, type Schema } from "./definitions";
import * as yaml from "js-yaml";

// ... existing readCodeBlock ...

function parseSchema(lang: string, code: string): Schema {
  let parsed: unknown;
  // ... existing YAML/JSON parsing logic ...

  // NEW: Zod Validation
  const result = SchemaSchema.safeParse(parsed);

  if (!result.success) {
    // Format Zod errors into a readable string
    const errorMessage = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");

    throw new SchemaError(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      message: `Validation failed: ${errorMessage}`,
    });
  }

  return result.data;
}
```

---

### Phase 2: Correctness (Fix the Empty Object Trap)

**Goal:** Ensure that clicking "Cancel" returns `null`, not `{}`.

**1. Update `src/form/SchemaFormModal.ts`:**

```typescript
export class SchemaFormModal extends Modal {
  // ... existing code ...

  onClose() {
    this.contentEl.empty();
    if (!this.isSubmitted) {
      // FIX: Explicitly pass null to signal cancellation
      this.onSubmit(null);
    }
  }
}
```

**2. Update `src/api.ts`:**
Handle the null case gracefully.

```typescript
triggerForm = async (schemaName?: string): Promise<FormData> => {
  // ... existing setup ...
  const result = await formHandler.showForm();

  if (!result) {
    // This is now unreachable if success=true,
    // but ensures we catch the 'null' from cancellation
    throw new FormError("Form cancelled by user");
  }

  this.plugin.submitFormData(result);
  return result as FormData;
};
```

---

### Phase 3: The Renderer Strategy Pattern (De-spaghetti)

**Goal:** Break the `FormRenderer` God Object into small, testable files.

**1. Create `src/form/renderers/types.ts`:**

```typescript
import type { Field } from "../../schema/definitions";
import type { FormState } from "../FormState";

export interface FieldRendererStrategy {
  /** Returns true if this renderer handles the given field type */
  supports(type: string): boolean;

  /** Renders the field into the container */
  render(container: HTMLElement, field: Field, state: FormState): void;
}
```

**2. Create Strategy Implementations (e.g., `src/form/renderers/TextFieldRenderer.ts`):**
Move logic from the big switch statement here.

```typescript
import { Setting } from "obsidian";
import type { TextField } from "../../schema/definitions";
import type { FieldRendererStrategy } from "./types";
import type { FormState } from "../FormState";

export class TextFieldRenderer implements FieldRendererStrategy {
  supports(type: string) {
    return type === "TEXT";
  }

  render(container: HTMLElement, field: TextField, state: FormState) {
    new Setting(container)
      .setName(field.label || field.name)
      .setDesc(field.description || "")
      .addText((text) => {
        text
          .setPlaceholder(field.placeholder || "")
          .setValue((state.getValue(field.name) as string) || "")
          .onChange((value) => {
            // DEBOUNCE HERE if needed, not in FormState
            state.setValue(field.name, value);
          });
      });
  }
}
```

**3. Refactor `src/form/FormRenderer.ts`:**
It becomes a lightweight registry.

```typescript
import { TextFieldRenderer } from "./renderers/TextFieldRenderer";
// ... other imports

export class FormRenderer {
  private strategies: FieldRendererStrategy[];

  constructor(private state: FormState) {
    this.strategies = [
      new TextFieldRenderer(),
      new NumberFieldRenderer(),
      new SelectFieldRenderer(),
      // ... register all
    ];
  }

  private renderField(container: HTMLElement, field: Field): void {
    const strategy = this.strategies.find((s) => s.supports(field.type));

    if (strategy) {
      strategy.render(container, field, this.state);
    } else {
      this.renderUnknownField(container, field);
    }

    // Setup validation hook separately if needed
  }
}
```

---

### Phase 4: State & UX (Fix the Lag)

**Goal:** Remove the global 300ms delay that makes checkboxes feel sluggish, while keeping text inputs performant.

**1. Fix `src/form/FormState.ts`:**
Remove the generic debounce.

```typescript
// Remove this:
// private debouncedNotifyValidation = debounce(...)

setValue(fieldName: string, value: unknown): void {
  // ... sanitize ...
  this.data[fieldName] = sanitizedValue;

  if (oldValue !== sanitizedValue) {
    this.notifyFieldListeners(fieldName, sanitizedValue);
    // Immediate notification:
    this.notifyValidationListeners();
  }
}

```

**2. Add Debounce Only Where Needed:**
In your `TextFieldRenderer` (and `TextArea`), use Obsidian's `debounce`.

```typescript
import { debounce } from "obsidian";

// In TextFieldRenderer.ts
.onChange(debounce((value: string) => {
    state.setValue(field.name, value);
}, 300));

```

_Note: For Toggles/Selects, call `state.setValue` immediately. They will now feel instant._

---

### Phase 5: Encapsulation (Protect the Data)

**Goal:** Stop exposing raw data arrays in `main.ts`.

**1. Update `src/main.ts`:**

```typescript
export default class SchemaFormPlugin extends Plugin {
  // Make private
  private _formData: Record<string, unknown> = {};
  private _labelData: Record<string, string> = {};

  // Public accessors for your API
  getFormData() {
    return { ...this._formData };
  } // Return copy
  getLabelData() {
    return { ...this._labelData };
  }

  submitFormData(submitted: {
    data: Record<string, unknown>;
    label: Record<string, string>;
  }) {
    this._formData = submitted.data;
    this._labelData = submitted.label;
  }
}
```

**2. Update `src/api.ts`:**
Use the getters.

```typescript
value = (fieldName: string): unknown => {
  return this.plugin.getFormData()[fieldName] ?? null;
};
```

### Execution Order

1. **Phase 1 (Zod)** is the most critical for stability. Do this first.
2. **Phase 4 (Debounce)** is a quick win for UX.
3. **Phase 2 (Cancellation)** fixes a logic bug.
4. **Phase 3 (Renderer)** is the largest code change; do this when you have time for a full refactor.
5. **Phase 5 (Encapsulation)** is a quick "good practice" cleanup.

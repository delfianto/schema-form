import type { Field, Schema } from "../schema";
import { cssClass, SCHEMA_FORM_STYLE } from "../style";
import * as Log from "../utils/logger";
import { wrapWithErrorBoundary } from "./ErrorBoundary";
import type { FormState } from "./FormState";
import {
  DateFieldRenderer,
  type FieldRendererStrategy,
  MultiSelectFieldRenderer,
  NumberFieldRenderer,
  SelectFieldRenderer,
  TextAreaFieldRenderer,
  TextFieldRenderer,
  ToggleFieldRenderer,
} from "./renderers";

export class FormRenderer {
  private state: FormState;
  private elements: Map<string, HTMLElement> = new Map();
  private strategies: FieldRendererStrategy[];

  constructor(formState: FormState) {
    this.state = formState;
    this.strategies = [
      new TextFieldRenderer(),
      new TextAreaFieldRenderer(),
      new NumberFieldRenderer(),
      new ToggleFieldRenderer(),
      new SelectFieldRenderer(),
      new MultiSelectFieldRenderer(),
      new DateFieldRenderer(),
    ];
  }

  renderSchema(container: HTMLElement, schema: Schema): void {
    this.setupDefaults(schema);

    schema.fields.forEach((field) => {
      wrapWithErrorBoundary(
        () => {
          this.renderField(container, field);
          this.state.setLabel(field.name, field.label || field.name);
        },
        (error) => {
          Log.error(`Error rendering field ${field.name}:`, error);
          this.renderErrorField(container, field, error.message);
        }
      );
    });
  }

  private renderField(container: HTMLElement, field: Field): void {
    const fieldContainer = container.createEl("div", {
      cls: `field-${field.name}`,
    });

    this.elements.set(field.name, fieldContainer);

    this.addValidatorForField(field);

    const strategy = this.strategies.find((s) => s.supports(field.type));

    if (strategy) {
      strategy.render(fieldContainer, field, this.state);
    } else {
      this.renderUnknownField(fieldContainer, field);
    }
  }

  getFieldElement(fieldName: string): HTMLElement | undefined {
    return this.elements.get(fieldName);
  }

  private renderErrorField(container: HTMLElement, field: Field, msg: string): void {
    container.createEl("div", {
      text: `Error rendering field "${field.name}": ${msg}`,
      cls: cssClass(SCHEMA_FORM_STYLE.FORM_ERROR),
    });
  }

  private renderUnknownField(container: HTMLElement, field: Field): void {
    container.createEl("div", {
      text: `Unknown field type: ${field.type} for field "${field.name}"`,
      cls: cssClass(SCHEMA_FORM_STYLE.FORM_ERROR),
    });
  }

  private addValidatorForField(field: Field): void {
    const strategy = this.strategies.find((s) => s.supports(field.type));

    if (strategy) {
      this.state.addValidator(field.name, (value) => strategy.getValidator(field)(value));
    } else {
      // Basic required check fallback for unknown fields
      this.state.addValidator(field.name, (value) => {
        const errors: string[] = [];
        if (field.required && (value === undefined || value === null || value === "")) {
          errors.push(`${field.label || field.name} is required`);
        }
        return errors;
      });
    }
  }

  private setupDefaults(schema: Schema): void {
    const defaults: Record<string, unknown> = {};
    schema.fields.forEach((field) => {
      if (field.default !== undefined) {
        defaults[field.name] = field.default;
      }
    });
    this.state.setDefaults(defaults);
  }
}

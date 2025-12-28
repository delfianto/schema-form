import type { Field, Schema } from "../schema";
import { cssClass, SCHEMA_FORM_STYLE } from "../style";
import * as Log from "../utils/logger";
import { wrapWithErrorBoundary } from "./ErrorBoundary";
import type { FormState } from "./FormState";
import { defaultRegistry, type RendererRegistry } from "./RendererRegistry";
import type { FieldRendererStrategy } from "./renderers/types";

export class FormRenderer {
  private state: FormState;
  private registry: RendererRegistry;
  private elements: Map<string, HTMLElement> = new Map();

  constructor(formState: FormState, registry: RendererRegistry = defaultRegistry) {
    this.state = formState;
    this.registry = registry;
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
        },
      );
    });
  }

  private renderField(container: HTMLElement, field: Field): void {
    const fieldContainer = container.createEl("div", {
      cls: `field-${field.name}`,
    });

    this.elements.set(field.name, fieldContainer);

    this.addValidatorForField(field);

    const strategy = this.getStrategy(field.type);
    strategy.render(fieldContainer, field, this.state);
  }

  private getStrategy(type: string): FieldRendererStrategy<Field> {
    return this.registry.getStrategy(type);
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

  private addValidatorForField(field: Field): void {
    const strategy = this.getStrategy(field.type);

    const validator = strategy.getValidator(field);

    this.state.addValidator(field.name, validator);
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

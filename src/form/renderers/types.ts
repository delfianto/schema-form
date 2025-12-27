import type { Field } from "../../schema/definitions";
import type { FormState } from "../FormState";

/**
 * Interface for field rendering strategies.
 */
export interface FieldRendererStrategy<T extends Field = Field> {
  /**
   * Returns true if this renderer handles the given field type.
   */
  supports(type: string): boolean;

  /**
   * Renders the field into the container.
   */
  render(container: HTMLElement, field: T, state: FormState): void;

  /**
   * Returns a validation function for this field.
   */
  getValidator(field: T): (value: unknown) => string[];
}

/**
 * Base class for field renderers providing common helpers.
 */
export abstract class BaseFieldRenderer {
  protected label(field: Field): string {
    return (field.label || field.name) + (field.required ? " *" : "");
  }

  protected desc(field: Field): string {
    return field.description || "";
  }

  protected placeholder(field: Field): string {
    return field.required ? "Required" : "Optional";
  }

  protected stateValue(field: Field, state: FormState): string {
    return state.getValue(field.name)?.toString() || "";
  }

  protected validateRequired(field: Field, value: unknown): string[] {
    const errors: string[] = [];
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && isEmpty) {
      errors.push(`${field.label || field.name} is required`);
    }
    return errors;
  }
}

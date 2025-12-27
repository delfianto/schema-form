import { Setting } from "obsidian";
import type {
  DateField,
  Field,
  MultiSelectField,
  NumberField,
  Schema,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from "../schema";
import { cssClass, SCHEMA_FORM_STYLE } from "../style";
import * as Log from "../utils/logger";
import { wrapWithErrorBoundary } from "./ErrorBoundary";
import type { FormState } from "./FormState";

export class FormRenderer {
  private state: FormState;
  private elements: Map<string, HTMLElement> = new Map();

  constructor(formState: FormState) {
    this.state = formState;
  }

  renderSchema(container: HTMLElement, schema: Schema): void {
    this.setupDefaults(schema);

    schema.fields.forEach((field) => {
      wrapWithErrorBoundary(
        () => {
          this.renderField(container, field);
          this.state.setLabel(field.name, field.label);
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

    switch (field.type) {
      case "TEXT":
        this.renderTextField(fieldContainer, field);
        break;
      case "TEXT_AREA":
        this.renderTextAreaField(fieldContainer, field);
        break;
      case "NUMBER":
        this.renderNumberField(fieldContainer, field);
        break;
      case "TOGGLE":
        this.renderToggleField(fieldContainer, field);
        break;
      case "SELECT":
        this.renderSelectField(fieldContainer, field);
        break;
      case "MULTI_SELECT":
        this.renderMultiSelectField(fieldContainer, field as MultiSelectField);
        break;
      case "DATE":
        this.renderDateField(fieldContainer, field);
        break;
      default:
        this.renderUnknownField(fieldContainer, field);
    }
  }

  getFieldElement(fieldName: string): HTMLElement | undefined {
    return this.elements.get(fieldName);
  }

  private label(field: Field): string {
    return (field.label || field.name) + (field.required ? " *" : "");
  }

  private desc(field: Field): string {
    return field.description || "";
  }

  private placeholder(field: Field): string {
    return field.required ? "Required" : "Optional";
  }

  private stateValue(field: Field): string {
    return this.state.getValue(field.name)?.toString() || "";
  }

  private renderTextField(container: HTMLElement, field: TextField): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addText((text) => {
      text
        .setPlaceholder(this.placeholder(field))
        .setValue(this.stateValue(field))
        .onChange((value) => {
          this.state.setValue(field.name, value);
        });
    });
  }

  private renderTextAreaField(container: HTMLElement, field: TextAreaField): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addTextArea((textarea) => {
      textarea
        .setPlaceholder(this.placeholder(field))
        .setValue(this.stateValue(field))
        .onChange((value) => {
          this.state.setValue(field.name, value);
        });
    });
  }

  private renderNumberField(container: HTMLElement, field: NumberField): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addText((text) => {
      text.inputEl.type = "number";
      text.setPlaceholder(this.placeholder(field)).setValue(this.stateValue(field));

      if (field.min !== undefined) {
        text.inputEl.min = String(field.min);
      }

      if (field.max !== undefined) {
        text.inputEl.max = String(field.max);
      }

      text.onChange((value) => {
        this.state.setValue(field.name, value ? Number(value) : undefined);
      });
    });
  }

  private renderToggleField(container: HTMLElement, field: ToggleField): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addToggle((toggle) => {
      const currentValue = this.state.getValue(field.name) as boolean | undefined;
      const booleanValue = currentValue ?? field.default ?? false;

      toggle.setValue(booleanValue).onChange((value) => {
        this.state.setValue(field.name, value);
      });
    });

    if (this.state.getValue(field.name) === undefined) {
      this.state.setValue(field.name, field.default ?? false);
    }
  }

  private renderSelectField(container: HTMLElement, field: SelectField): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addDropdown((dropdown) => {
      if (field.options && Array.isArray(field.options)) {
        field.options.forEach((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          dropdown.addOption(value, label);
        });

        const currentValue = this.state.getValue(field.name) as string | undefined;
        const stringValue =
          currentValue ||
          (typeof field.options[0] === "string" ? field.options[0] : field.options[0]?.value) ||
          "";
        dropdown.setValue(stringValue);

        if (!this.state.getValue(field.name)) {
          this.state.setValue(field.name, stringValue);
        }
      }

      dropdown.onChange((value) => {
        this.state.setValue(field.name, value);
      });
    });
  }

  private renderMultiSelectField(container: HTMLElement, field: MultiSelectField): void {
    new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    const optionsContainer = container.createDiv({
      cls: cssClass(SCHEMA_FORM_STYLE.MULTI_SELECT_CONTAINER || "multi-select-container"),
    });

    const selectedValues = new Set<string>((this.state.getValue(field.name) as string[]) || []);

    if (field.options && Array.isArray(field.options)) {
      field.options.forEach((option: string | { value: string; label: string }) => {
        const value = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;

        const row = optionsContainer.createDiv({
          cls: cssClass(SCHEMA_FORM_STYLE.MULTI_SELECT_ROW),
        });
        const checkbox = row.createEl("input", { type: "checkbox" });
        checkbox.checked = selectedValues.has(value);
        row.createEl("label", { text: label });

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedValues.add(value);
          } else {
            selectedValues.delete(value);
          }
          this.state.setValue(field.name, Array.from(selectedValues));
        });
      });
    }
  }

  private renderDateField(container: HTMLElement, field: DateField): void {
    const setting = new Setting(container).setName(this.label(field)).setDesc(this.desc(field));

    setting.addText((text) => {
      text.inputEl.type = "date";

      const currentValue = this.state.getValue(field.name) as string | undefined;
      const stringValue = currentValue || "";
      text.setValue(stringValue);

      if (field.minDate) {
        text.inputEl.min = field.minDate;
      }

      if (field.maxDate) {
        text.inputEl.max = field.maxDate;
      }

      text.onChange((value) => {
        this.state.setValue(field.name, value);
      });

      text.setPlaceholder(field.required ? "Required" : "Optional");
    });
  }

  private renderErrorField(container: HTMLElement, field: Field, msg: string): void {
    container.createEl("div", {
      text: `Error rendering field "${field.name}": ${msg}`,
      cls: cssClass(SCHEMA_FORM_STYLE.FORM_ERROR),
    });
  }

  private renderUnknownField(container: HTMLElement, field: Field): void {
    new Setting(container).setName(this.label(field)).setDesc(`Unknown field type: ${field.type}`);
  }

  private addValidatorForField(field: Field): void {
    this.state.addValidator(field.name, (value) => {
      const errors: string[] = [];

      if (field.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field.label || field.name} is required`);
      }

      switch (field.type) {
        case "TEXT":
          if (typeof value === "string") {
            if (field.minLength && value.length < field.minLength) {
              errors.push(`Minimum length is ${field.minLength}`);
            }
            if (field.maxLength && value.length > field.maxLength) {
              errors.push(`Maximum length is ${field.maxLength}`);
            }
            if (field.regex) {
              const re = new RegExp(field.regex);
              if (!re.test(value)) {
                errors.push("Invalid format");
              }
            }
          }
          break;
        case "NUMBER":
          if (typeof value === "number") {
            if (field.min !== undefined && value < field.min) {
              errors.push(`Minimum value is ${field.min}`);
            }
            if (field.max !== undefined && value > field.max) {
              errors.push(`Maximum value is ${field.max}`);
            }
          }
          break;
      }

      return errors;
    });
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

import { Setting } from "obsidian";
import type {
  DateField,
  Field,
  NumberField,
  Schema,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from "../schema";
import { assertIsError } from "../utils/quirks";
import type { FormState } from "./form-state";

export class FormRenderer {
  private state: FormState;
  private elements: Map<string, HTMLElement> = new Map();

  constructor(formState: FormState) {
    this.state = formState;
  }

  renderSchema(container: HTMLElement, schema: Schema): void {
    this.setupDefaults(schema);

    schema.fields.forEach((field) => {
      try {
        this.renderField(container, field);
      } catch (error) {
        assertIsError(error);
        console.error(`Error rendering field ${field.name}:`, error);
        this.renderErrorField(container, field, error.message);
      }
    });
  }

  private renderField(container: HTMLElement, field: Field): void {
    const fieldContainer = container.createEl("div", {
      cls: `field-${field.name}`,
    });

    this.elements.set(field.name, fieldContainer);

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
        // TODO: implement this
        // this.renderSelectField(fieldContainer, field);
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
          dropdown.addOption(String(option), String(option));
        });

        const currentValue = this.state.getValue(field.name) as string | undefined;
        const stringValue = currentValue || (field.options[0] as string);
        dropdown.setValue(stringValue);

        if (!this.state.getValue(field.name)) {
          this.state.setValue(field.name, field.options[0]);
        }
      }

      dropdown.onChange((value) => {
        this.state.setValue(field.name, value);
      });
    });
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
      cls: "schema-form-error",
    });
  }

  private renderUnknownField(container: HTMLElement, field: Field): void {
    new Setting(container).setName(this.label(field)).setDesc(`Unknown field type: ${field.type}`);
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

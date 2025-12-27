import { sanitizeFormValue } from "../utils/sanitize";

export class FormState {
  private data: Record<string, unknown> = {};
  private label: Record<string, string> = {};

  private validators: Map<string, (value: unknown) => string[]> = new Map();
  private changeListeners: Map<string, Set<(value: unknown) => void>> = new Map();
  private errorListeners: Map<string, Set<(errors: string[]) => void>> = new Map();
  private validationListeners: Set<() => void> = new Set();

  constructor(init: Record<string, unknown> = {}) {
    this.data = { ...init };
  }

  getValue(fieldName: string): unknown {
    return this.data[fieldName];
  }

  setValue(fieldName: string, value: unknown): void {
    const sanitizedValue = sanitizeFormValue(value);
    const oldValue = this.data[fieldName];
    this.data[fieldName] = sanitizedValue;

    if (oldValue !== sanitizedValue) {
      this.notifyFieldListeners(fieldName, sanitizedValue);

      // ✅ NEW: Run validation immediately on change
      const errors = this.validateField(fieldName);
      this.notifyErrorListeners(fieldName, errors);

      this.notifyValidationListeners();
    }
  }

  getLabel(fieldName: string): string | undefined {
    return this.label[fieldName];
  }

  setLabel(fieldName: string, label: string): void {
    this.label[fieldName] = label;
  }

  getAllData(): Record<string, unknown> {
    return { data: this.data, label: this.label };
  }

  setDefaults(defaults: Record<string, unknown>): void {
    Object.entries(defaults).forEach(([key, value]) => {
      if (this.data[key] === undefined) {
        this.data[key] = value;
      }
    });
  }

  addValidator(fieldName: string, validator: (value: unknown) => string[]): void {
    this.validators.set(fieldName, validator);
  }

  validateField(fieldName: string): string[] {
    const validator = this.validators.get(fieldName);
    return validator ? validator(this.getValue(fieldName)) : [];
  }

  validateAll(): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    this.validators.forEach((validator, fieldName) => {
      const fieldErrors = validator(this.getValue(fieldName));
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  onFieldChange(fieldName: string, listener: (value: unknown) => void): void {
    if (!this.changeListeners.has(fieldName)) {
      this.changeListeners.set(fieldName, new Set());
    }

    if (listener) {
      this.changeListeners.get(fieldName)?.add(listener);
    }
  }

  onValidationChange(listener: () => void): void {
    this.validationListeners.add(listener);
  }

  onErrorChange(fieldName: string, listener: (errors: string[]) => void): void {
    if (!this.errorListeners.has(fieldName)) {
      this.errorListeners.set(fieldName, new Set());
    }
    this.errorListeners.get(fieldName)?.add(listener);
  }

  private notifyFieldListeners(fieldName: string, value: unknown): void {
    const listeners = this.changeListeners.get(fieldName);

    if (listeners) {
      listeners.forEach((listener) => {
        listener(value);
      });
    }
  }

  private notifyErrorListeners(fieldName: string, errors: string[]): void {
    const listeners = this.errorListeners.get(fieldName);
    if (listeners) {
      listeners.forEach((listener) => {
        listener(errors);
      });
    }
  }

  private notifyValidationListeners(): void {
    this.validationListeners.forEach((listener) => {
      listener();
    });
  }
}

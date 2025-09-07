export class FormState {
  private data: Record<string, unknown> = {};
  private validators: Map<string, (value: unknown) => string[]> = new Map();
  private changeListeners: Map<string, Set<(value: unknown) => void>> = new Map();
  private validationListeners: Set<() => void> = new Set();

  constructor(init: Record<string, unknown> = {}) {
    this.data = { ...init };
  }

  // Data management
  getValue(fieldName: string): unknown {
    return this.data[fieldName];
  }

  setValue(fieldName: string, value: unknown): void {
    const oldValue = this.data[fieldName];
    this.data[fieldName] = value;

    if (oldValue !== value) {
      this.notifyFieldListeners(fieldName, value);
      this.notifyValidationListeners();
    }
  }

  getAllData(): Record<string, unknown> {
    return { ...this.data };
  }

  setDefaults(defaults: Record<string, unknown>): void {
    Object.entries(defaults).forEach(([key, value]) => {
      if (this.data[key] === undefined) {
        this.data[key] = value;
      }
    });
  }

  // Validation management
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

  // Event system
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

  private notifyFieldListeners(fieldName: string, value: unknown): void {
    const listeners = this.changeListeners.get(fieldName);

    if (listeners) {
      listeners.forEach((listener) => {
        listener(value);
      });
    }
  }

  private notifyValidationListeners(): void {
    this.validationListeners.forEach((listener) => {
      listener();
    });
  }
}

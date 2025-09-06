// src/constants/css-classes.ts
export const SCHEMA_FORM_STYLE = {
  // Plugin prefix for all classes to avoid conflicts
  PREFIX: 'scmf',

  // Main containers
  PLUGIN_CONTAINER: 'scmf-plugin',
  MODAL_CONTAINER: 'scmf-modal',

  // Form elements
  FORM_CONTAINER: 'scmf-container',
  FORM_FIELD: 'scmf-field',
  FORM_FIELD_REQUIRED: 'scmf-field--required',
  FORM_FIELD_ERROR: 'scmf-field--error',

  // Inputs
  INPUT_TEXT: 'scmf-input',
  INPUT_TEXTAREA: 'scmf-textarea',
  INPUT_SELECT: 'scmf-select',

  // Buttons
  BTN_SUBMIT: 'scmf-btn-submit',
  BTN_CANCEL: 'scmf-btn-cancel',

  // States
  LOADING: 'scmf--loading',
  ERROR: 'scmf--error',
  SUCCESS: 'scmf--success',
} as const;

// Type for the CSS class keys
export type CssClassKey = keyof typeof SCHEMA_FORM_STYLE;

export const getPluginClass = (className: string): string => {
  return `${SCHEMA_FORM_STYLE.PREFIX}-${className}`;
};

// Usage in your Obsidian plugin
// import { SCHEMA_FORM_STYLE, getPluginClass } from './constants/css-classes';

// // In your modal/form creation code
// const modal = new Modal(this.app);
// modal.containerEl.addClass(SCHEMA_FORM_STYLE.MODAL_CONTAINER);

// const formContainer = modal.contentEl.createDiv();
// formContainer.addClass(SCHEMA_FORM_STYLE.FORM_CONTAINER);

// // Your specific example
// someElement.addClass(SCHEMA_FORM_STYLE.FOO_BAR);

// src/constants/css-classes.ts
export const SCHEMA_FORM_STYLE = {
  // Plugin prefix for all classes to avoid conflicts
  PREFIX: 'scmf',

  ERROR_STACKTRACE: 'scmf-error-stacktrace'
} as const;

// Type for the CSS class keys
export type CssClassKey = keyof typeof SCHEMA_FORM_STYLE;

export const getPluginClass = (className: string): string => {
  return `${SCHEMA_FORM_STYLE.PREFIX}-${className}`;
};

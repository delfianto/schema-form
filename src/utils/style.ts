export const SCHEMA_FORM_STYLE = {
  // Plugin prefix for all classes to avoid conflicts
  PREFIX: "scmf",

  // Error modal
  ERROR_STACKTRACE: "error-stacktrace",

  // Plugin settings view
  SCHEMA_DIR_ERROR: "schema-dir-status-err",
  SCHEMA_DIR_SUCCESS: "schema-dir-status-ok",
  SETTINGS_ITEM_DESC: "setting-item-desc",
} as const;

// Type for the CSS class keys
export type CssClassKey = keyof typeof SCHEMA_FORM_STYLE;

export const getPluginClass = (...classNames: string[]): string => {
  return classNames
    .filter((className) => className.trim()) // Remove empty strings
    .map((className) => `${SCHEMA_FORM_STYLE.PREFIX}-${className}`)
    .join(" ");
};

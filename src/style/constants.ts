export const SCHEMA_FORM_STYLE = {
  PREFIX: "scmf",

  ERROR_STACKTRACE: "error-stacktrace",
  ERROR_MESSAGE: "error-message",

  DEBUG_VALUE: "debug-value",
  DEBUG_ERROR_TREE: "debug-error-tree",

  FORM_ERROR: "form-error",
  FORM_WARNING: "form-warning",

  SCHEMA_DIR_ERROR: "schema-dir-status-err",
  SCHEMA_DIR_SUCCESS: "schema-dir-status-ok",

  SETTINGS_ITEM_DESC: "setting-item-desc",
  SETTINGS_DEBUG_BTN: "setting-debug-button",

  MULTI_SELECT_CONTAINER: "multi-select-container",
  MULTI_SELECT_ROW: "multi-select-row",
} as const;

export type CssClassKey = keyof typeof SCHEMA_FORM_STYLE;

export const cssClass = (...classNames: string[]): string => {
  return classNames
    .filter((className) => className.trim())
    .map((className) => `${SCHEMA_FORM_STYLE.PREFIX}-${className}`)
    .join(" ");
};

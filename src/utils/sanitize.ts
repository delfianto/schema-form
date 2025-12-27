/**
 * Sanitizes a form value to prevent XSS.
 * If the value is a string, it escapes HTML characters.
 */
export function sanitizeFormValue(value: unknown): unknown {
  if (typeof value === "string") {
    // Basic HTML escaping
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }
  return value;
}

export function sanitizeFormValue(value: unknown): unknown {
  if (typeof value === "string") {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }
  return value;
}

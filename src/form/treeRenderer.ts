import { cssClass, SCHEMA_FORM_STYLE } from "../style";

export function renderFromObject(
  container: HTMLElement,
  obj: unknown,
  label: string = "Root"
): void {
  const isObject = obj !== null && typeof obj === "object";
  const isArray = Array.isArray(obj);
  const isEmpty = isObject && (isArray ? obj.length === 0 : Object.keys(obj).length === 0);

  // Create the main <details> element for this node
  const detailsEl = container.createEl("details");
  const summaryEl = detailsEl.createEl("summary", { text: label });

  // Style the summary for better readability (optional)
  summaryEl.style.fontWeight = "bold";

  if (!isObject) {
    // --- Primitive Value ---
    // Display the value in the summary or a child <pre> if it's long-ish
    const valueString = String(obj);
    if (valueString.length > 50) {
      // For longer strings/primitives, put value in a child element
      detailsEl.createEl("pre", {
        text: valueString,
        cls: cssClass(SCHEMA_FORM_STYLE.DEBUG_VALUE),
      }).style.marginLeft = "20px";
    } else {
      summaryEl.textContent += `: ${valueString}`;
    }

    // No children to process
    return;
  }

  if (isEmpty) {
    // --- Empty Object/Array ---
    summaryEl.textContent += `: ${isArray ? "[]" : "{}"}`;
    return;
  }

  // --- Non-empty Object/Array ---
  // Open the top level by default for easier inspection, or control via parameters
  if (label === "Root") {
    detailsEl.open = true;
  }

  // Determine iterator and prefix for children
  const entries = isArray ? obj.entries() : Object.entries(obj);

  for (const [key, value] of entries) {
    const childLabel = isArray ? `[${key}]` : `${key}`; // Format key for arrays/objects
    if (value !== null && typeof value === "object") {
      // --- Recursive Case for Nested Objects/Arrays ---
      const childContainer = detailsEl.createEl("div"); // Wrapper div for child tree
      renderFromObject(childContainer, value, childLabel);
    } else {
      // --- Leaf Node (Primitive Value) ---
      const valueString = String(value);
      const leafDetailsEl = detailsEl.createEl("details");
      const leafSummaryEl = leafDetailsEl.createEl("summary", { text: childLabel });
      if (valueString.length > 50) {
        leafDetailsEl.createEl("pre", {
          text: valueString,
          cls: cssClass(SCHEMA_FORM_STYLE.DEBUG_VALUE),
        }).style.marginLeft = "20px";
      } else {
        leafSummaryEl.textContent += `: ${valueString}`;
      }
      leafDetailsEl.style.marginLeft = "20px"; // Indent children slightly
    }
  }
}

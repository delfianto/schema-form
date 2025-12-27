import { cssClass, SCHEMA_FORM_STYLE } from "../style";

export function renderFromObject(
  container: HTMLElement,
  obj: unknown,
  label: string = "Root",
): void {
  const isObject = obj !== null && typeof obj === "object";
  const isArray = Array.isArray(obj);
  const isEmpty = isObject && (isArray ? obj.length === 0 : Object.keys(obj).length === 0);

  const detailsEl = container.createEl("details");
  const summaryEl = detailsEl.createEl("summary", { text: label });

  summaryEl.style.fontWeight = "bold";

  if (!isObject) {
    const valueString = String(obj);
    if (valueString.length > 50) {
      detailsEl.createEl("pre", {
        text: valueString,
        cls: cssClass(SCHEMA_FORM_STYLE.DEBUG_VALUE),
      }).style.marginLeft = "20px";
    } else {
      summaryEl.textContent += `: ${valueString}`;
    }

    return;
  }

  if (isEmpty) {
    summaryEl.textContent += `: ${isArray ? "[]" : "{}"}`;
    return;
  }

  if (label === "Root") {
    detailsEl.open = true;
  }

  const entries = isArray ? obj.entries() : Object.entries(obj);

  for (const [key, value] of entries) {
    const childLabel = isArray ? `[${key}]` : `${key}`;
    if (value !== null && typeof value === "object") {
      const childContainer = detailsEl.createEl("div");
      renderFromObject(childContainer, value, childLabel);
    } else {
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
      leafDetailsEl.style.marginLeft = "20px";
    }
  }
}

export function normalizeContent(raw) {
  if (typeof raw !== "string") return "";
  let cleaned = raw.trim();
  // Strip accidental markdown code fences
  cleaned = cleaned.replace(/^```[a-zA-Z]*\r?\n/, "");
  cleaned = cleaned.replace(/\r?\n```$/, "");
  return cleaned;
}
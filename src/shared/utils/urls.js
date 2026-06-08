const INVALID_URL_VALUES = new Set([
  "",
  "#",
  "-",
  "null",
  "none",
  "n/a",
  "해당없음",
  "없음",
  "미정",
  "준비중",
]);

export function normalizeUrl(value) {
  if (!value || typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (INVALID_URL_VALUES.has(trimmedValue.toLowerCase())) return null;

  const withScheme = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue.replace(/^\/+/, "")}`;

  try {
    const url = new URL(withScheme);
    if (!url.hostname || !url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function getScholarshipUrl(scholarship) {
  return normalizeUrl(scholarship?.url || scholarship?.homepage_url || scholarship?.link);
}

export function extractReasons(raw) {
  if (!raw) return [];

  let data = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return [data];
    }
  }

  if (Array.isArray(data)) {
    return data.map(String);
  }

  if (typeof data === "object") {
    const reasons = [];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        value.forEach((item) => reasons.push(`${key}: ${item}`));
      } else if (value && typeof value === "object") {
        for (const [childKey, childValue] of Object.entries(value)) {
          reasons.push(`${key}/${childKey}: ${childValue}`);
        }
      } else if (value !== undefined && value !== null && value !== "") {
        reasons.push(`${key}: ${value}`);
      }
    }
    return reasons.length ? reasons : [JSON.stringify(data)];
  }

  return [String(data)];
}

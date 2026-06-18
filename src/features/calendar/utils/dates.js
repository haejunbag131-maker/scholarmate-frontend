export function parseDateOnly(value) {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function getDaysUntil(deadlineValue, baseDate = new Date()) {
  const deadline = parseDateOnly(deadlineValue);
  if (!deadline) return null;
  const baseDateOnly = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate()
  );
  return Math.round((deadline - baseDateOnly) / (1000 * 60 * 60 * 24));
}

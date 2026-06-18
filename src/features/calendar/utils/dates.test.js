import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatDate, getDaysUntil, parseDateOnly } from "./dates.js";

describe("calendar date helpers", () => {
  it("parses date-only values without timezone shifting", () => {
    const date = parseDateOnly("2026-06-12T15:00:00Z");
    assert.equal(date.getFullYear(), 2026);
    assert.equal(date.getMonth(), 5);
    assert.equal(date.getDate(), 12);
  });

  it("formats local date as YYYY-MM-DD", () => {
    assert.equal(formatDate(new Date(2026, 0, 5)), "2026-01-05");
  });

  it("calculates remaining days from a fixed base date", () => {
    assert.equal(getDaysUntil("2026-06-15", new Date(2026, 5, 12)), 3);
  });
});

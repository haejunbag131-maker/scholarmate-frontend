import test from "node:test";
import assert from "node:assert/strict";
import { getScholarshipUrl, normalizeUrl } from "./urls.js";

test("normalizeUrl returns null for empty or placeholder values", () => {
  assert.equal(normalizeUrl(""), null);
  assert.equal(normalizeUrl("#"), null);
  assert.equal(normalizeUrl("없음"), null);
  assert.equal(normalizeUrl(null), null);
});

test("normalizeUrl keeps valid http urls", () => {
  assert.equal(normalizeUrl("https://example.com/path"), "https://example.com/path");
});

test("normalizeUrl adds https scheme to valid domains", () => {
  assert.equal(normalizeUrl("example.com"), "https://example.com/");
});

test("normalizeUrl rejects values without a real hostname", () => {
  assert.equal(normalizeUrl("example"), null);
});

test("getScholarshipUrl uses url fallback fields", () => {
  assert.equal(
    getScholarshipUrl({ homepage_url: "scholarship.example.com" }),
    "https://scholarship.example.com/"
  );
  assert.equal(getScholarshipUrl({ link: "https://example.com/apply" }), "https://example.com/apply");
});

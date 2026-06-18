import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPageList } from "./pagination.js";

describe("getPageList", () => {
  it("returns every page when total is small", () => {
    assert.deepEqual(getPageList(1, 5), [1, 2, 3, 4, 5]);
  });

  it("adds ellipsis around the current page", () => {
    assert.deepEqual(getPageList(6, 12), [1, 2, "…", 5, 6, 7, "…", 11, 12]);
  });

  it("keeps the beginning compact", () => {
    assert.deepEqual(getPageList(2, 10), [1, 2, 3, "…", 9, 10]);
  });
});

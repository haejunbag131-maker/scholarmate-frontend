import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractReasons } from "./reasons.js";

describe("extractReasons", () => {
  it("returns an empty array when no reason exists", () => {
    assert.deepEqual(extractReasons(null), []);
  });

  it("parses JSON array reasons", () => {
    assert.deepEqual(extractReasons('["성적 기준 충족","지역 조건 일치"]'), [
      "성적 기준 충족",
      "지역 조건 일치",
    ]);
  });

  it("flattens nested object reasons", () => {
    assert.deepEqual(extractReasons({ score: ["GPA 충족"], region: { match: true } }), [
      "score: GPA 충족",
      "region/match: true",
    ]);
  });

  it("keeps plain text reasons", () => {
    assert.deepEqual(extractReasons("지원 조건이 일치합니다."), [
      "지원 조건이 일치합니다.",
    ]);
  });
});

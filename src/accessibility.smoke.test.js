import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("home hero images are decorative and keep loading priority hints", async () => {
  const source = await readSource("./components/home/Slider.jsx");

  assert.match(source, /alt=""/);
  assert.match(source, /fetchpriority: index === 0 \? "high" : "auto"/);
  assert.match(source, /loading=\{index === 0 \? "eager" : "lazy"\}/);
});

test("home community preview reserves stable layout during async loading", async () => {
  const source = await readSource("./components/home/CommunityNotice.jsx");

  assert.match(source, /SkeletonList/);
  assert.match(source, /snap-x snap-mandatory/);
  assert.match(source, /overflow-x-auto/);
  assert.match(source, /min-\[769px\]:grid min-\[769px\]:grid-cols-2/);
  assert.match(source, /min-h-\[340px\].*sm:min-h-\[360px\]/);
});

test("message popover has keyboard and screen-reader affordances", async () => {
  const source = await readSource("./components/HeaderMessagesIcon.jsx");

  assert.match(source, /aria-label=\{`쪽지함/);
  assert.match(source, /e\.key === "Escape"/);
});

test("scholarship external links keep noopener protection", async () => {
  const sources = await Promise.all([
    readSource("./features/scholarships/components/ScholarshipResults.jsx"),
    readSource("./features/recommendations/components/RecommendationCard.jsx"),
    readSource("./features/scholarships/components/ScholarshipDetailModal.jsx"),
    readSource("./pages/Wishlist.jsx"),
  ]);

  for (const source of sources) {
    assert.match(source, /target="_blank"/);
    assert.match(source, /noopener/);
    assert.match(source, /noreferrer/);
  }
});

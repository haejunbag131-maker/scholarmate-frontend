import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const ACCESS_TOKEN = createToken({ sub: "recommendation-user", exp: 4_102_444_800 });
const REFRESH_TOKEN = createToken({ sub: "recommendation-user", exp: 4_102_444_800 });

const recommendation = {
  product_id: "recommendation-101",
  foundation_name: "미래인재재단",
  name: "이공계 성장 지원 장학금",
  recruitment_start: "2026-09-01",
  recruitment_end: "2026-09-30",
  support_details: "학기당 등록금 400만원",
  grade_criteria_details: "직전 학기 성적 3.5 이상",
  income_criteria_details: "학자금 지원구간 8구간 이하",
  recommendation_required: false,
  Reason: JSON.stringify([
    "이공계 전공 조건이 일치합니다.",
    "성적 기준을 충족합니다.",
  ]),
  homepage_url: "https://example.com/recommendations/101",
};

test("로그인 후 추천 이유를 확인하고 관심 장학금에 추가한다", async ({ page }) => {
  const api = await mockRecommendationApi(page);

  await page.goto("/recommendation");
  await expect(page).toHaveURL(/\/login$/);

  await login(page);

  await expect(page).toHaveURL(/\/recommendation$/);
  await expect(page.getByRole("heading", { name: "추천 장학금" })).toBeVisible();
  const card = page.getByRole("article").filter({ hasText: recommendation.name });
  await expect(card).toBeVisible();
  await expect.poll(() => api.recommendationAuthorization).toBe(
    `Bearer ${ACCESS_TOKEN}`
  );

  await card.getByRole("button", { name: "선별 이유" }).click();
  const reasonDialog = page.getByRole("dialog", { name: "선별 이유" });
  await expect(reasonDialog).toContainText("이공계 전공 조건이 일치합니다.");
  await expect(reasonDialog).toContainText("성적 기준을 충족합니다.");
  await reasonDialog.getByRole("button", { name: "닫기" }).click();

  await card.getByRole("button", { name: "상세 보기" }).click();
  const detailDialog = page.getByRole("dialog", {
    name: `${recommendation.name} 상세 정보`,
  });
  await expect(detailDialog).toContainText("학기당 등록금 400만원");
  await detailDialog.getByRole("button", { name: "닫기" }).click();

  await card.getByRole("button", { name: "관심 등록" }).click();
  await expect(page.getByRole("status")).toContainText(
    "관심 장학금에 추가되었습니다."
  );
  await expect.poll(() => api.favoriteIds.has(recommendation.product_id)).toBe(true);
  await expect(card.getByRole("button", { name: "관심 해제" })).toBeVisible();
});

async function login(page) {
  await page.getByPlaceholder("id").fill("recommendation-user");
  await page.getByPlaceholder("password").fill("correct-password");
  await page
    .getByRole("main")
    .getByRole("button", { name: "로그인", exact: true })
    .click();
}

async function mockRecommendationApi(page) {
  const state = {
    favoriteIds: new Set(),
    recommendationAuthorization: null,
  };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (!path.startsWith("/api/")) {
      await route.continue();
      return;
    }

    if (request.method() === "POST" && path === "/api/auth/jwt/create/") {
      expect(request.postDataJSON()).toEqual({
        username: "recommendation-user",
        password: "correct-password",
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ access: ACCESS_TOKEN, refresh: REFRESH_TOKEN }),
      });
      return;
    }

    if (
      request.method() === "GET" &&
      path === "/api/scholarships/recommendation/"
    ) {
      state.recommendationAuthorization = request.headers().authorization ?? null;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ scholarships: [recommendation] }),
      });
      return;
    }

    if (request.method() === "GET" && path === "/api/scholarships/wishlist/") {
      const body = [...state.favoriteIds].map((productId) => ({
        id: `wishlist-${productId}`,
        scholarship: recommendation,
      }));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
      return;
    }

    if (
      request.method() === "POST" &&
      path === "/api/scholarships/wishlist/add-from-api/"
    ) {
      const item = request.postDataJSON();
      state.favoriteIds.add(item.product_id);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ scholarship: item }),
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        detail: `Unhandled E2E API route: ${request.method()} ${path}`,
      }),
    });
  });

  return state;
}

function createToken(payload) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value))
      .toString("base64url")
      .replace(/=/g, "");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.e2e-signature`;
}

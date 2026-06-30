import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const ACCESS_TOKEN = createToken({ sub: "e2e-user", exp: 4_102_444_800 });
const REFRESH_TOKEN = createToken({ sub: "e2e-user", exp: 4_102_444_800 });

const scholarships = [
  {
    product_id: "scholarship-101",
    foundation_name: "한국장학재단",
    name: "이공계 미래인재 장학금",
    recruitment_start: "2026-07-01",
    recruitment_end: "2026-07-31",
    grade_criteria_details: "직전 학기 성적 3.5 이상",
    income_criteria_details: "학자금 지원구간 8구간 이하",
    support_details: "학기당 300만원",
    specific_qualification_details: "이공계 전공 재학생",
    residency_requirement_details: "제한 없음",
    selection_method_details: "서류 심사",
    number_of_recipients_details: "100명",
    eligibility_restrictions: "휴학생 제외",
    required_documents_details: "성적증명서, 재학증명서",
    recommendation_required: false,
    homepage_url: "https://example.com/scholarships/101",
  },
  {
    product_id: "scholarship-202",
    foundation_name: "서울인재재단",
    name: "지역인재 생활비 장학금",
    recruitment_start: "2026-08-01",
    recruitment_end: "2026-08-20",
    support_details: "생활비 200만원",
  },
];

test.describe("로그인 이후 장학금 핵심 흐름", () => {
  test("보호 페이지에서 로그인하면 원래 페이지로 복귀한다", async ({ page }) => {
    const api = await mockScholarshipApi(page);

    await page.goto("/scholarships");
    await expect(page).toHaveURL(/\/login$/);

    await login(page);

    await expect(page).toHaveURL(/\/scholarships$/);
    await expect(page.getByRole("heading", { name: "장학금 목록" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "이공계 미래인재 장학금" })).toBeVisible();
    await expect.poll(() => api.listAuthorization).toBe(`Bearer ${ACCESS_TOKEN}`);

    await expect
      .poll(() =>
        page.evaluate(() => ({
          access: localStorage.getItem("token"),
          refresh: localStorage.getItem("refreshToken"),
        }))
      )
      .toEqual({ access: ACCESS_TOKEN, refresh: REFRESH_TOKEN });
  });

  test("장학금을 검색하고 상세 정보를 확인한 뒤 관심 장학금에 추가한다", async ({ page }) => {
    const api = await mockScholarshipApi(page);

    await page.goto("/scholarships");
    await login(page);

    const searchInput = page.getByRole("searchbox", { name: "장학 사업명 검색" });
    await searchInput.fill("이공계");
    await searchInput.press("Enter");

    await expect.poll(() => api.lastSearch).toBe("이공계");
    const resultRow = page.getByRole("row").filter({ hasText: "이공계 미래인재 장학금" });
    await expect(resultRow).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "지역인재 생활비 장학금" })).toHaveCount(0);

    await resultRow.getByRole("button", { name: "상세 보기" }).click();
    const dialog = page.getByRole("dialog", { name: "이공계 미래인재 장학금 상세 정보" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("학기당 300만원");
    await dialog.getByRole("button", { name: "닫기" }).click();

    await resultRow.getByRole("button", { name: "관심 장학금 등록" }).click();
    await expect(page.getByRole("status")).toContainText("관심 장학금에 추가되었습니다.");
    await expect.poll(() => api.favoriteIds.has("scholarship-101")).toBe(true);
    await expect(resultRow.getByRole("button", { name: "관심 장학금 해제" })).toBeVisible();
  });
});

async function login(page) {
  await page.getByPlaceholder("id").fill("e2e-user");
  await page.getByPlaceholder("password").fill("correct-password");
  await page
    .getByRole("main")
    .getByRole("button", { name: "로그인", exact: true })
    .click();
}

async function mockScholarshipApi(page) {
  const state = {
    favoriteIds: new Set(),
    lastSearch: null,
    listAuthorization: null,
  };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    // Vite serves source modules such as /src/api/axios.js in development.
    // Only intercept backend calls under the root /api/ path.
    if (!path.startsWith("/api/")) {
      await route.continue();
      return;
    }

    if (request.method() === "POST" && path === "/api/auth/jwt/create/") {
      expect(request.postDataJSON()).toEqual({
        username: "e2e-user",
        password: "correct-password",
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ access: ACCESS_TOKEN, refresh: REFRESH_TOKEN }),
      });
      return;
    }

    if (request.method() === "GET" && path === "/api/scholarships/") {
      state.lastSearch = url.searchParams.get("search");
      state.listAuthorization = request.headers().authorization ?? null;
      const matchingScholarships = state.lastSearch
        ? scholarships.filter((item) => item.name.includes(state.lastSearch))
        : scholarships;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: matchingScholarships.length,
          results: matchingScholarships,
        }),
      });
      return;
    }

    if (request.method() === "GET" && path === "/api/scholarships/wishlist/") {
      const body = [...state.favoriteIds].map((productId) => ({
        id: `wishlist-${productId}`,
        scholarship: scholarships.find((item) => item.product_id === productId),
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
      body: JSON.stringify({ detail: `Unhandled E2E API route: ${request.method()} ${path}` }),
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

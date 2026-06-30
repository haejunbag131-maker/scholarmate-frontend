import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const EXPIRED_ACCESS_TOKEN = createToken({ sub: "e2e-user", exp: 1 });
const REFRESH_TOKEN = createToken({ sub: "e2e-user", exp: 4_102_444_800 });
const RENEWED_ACCESS_TOKEN = createToken({
  sub: "e2e-user",
  exp: 4_102_444_800,
  renewed: true,
});

const scholarship = {
  product_id: "scholarship-session-101",
  foundation_name: "한국장학재단",
  name: "세션 복구 확인 장학금",
  recruitment_start: "2026-07-01",
  recruitment_end: "2026-07-31",
};

test.describe("인증 세션 복구", () => {
  test("만료된 access token을 갱신하고 보호 페이지를 유지한다", async ({ page }) => {
    const api = await mockSessionApi(page, { refreshSucceeds: true });
    await seedExpiredAutoLoginSession(page);

    await page.goto("/scholarships");

    await expect(page.getByRole("heading", { name: "장학금 목록" })).toBeVisible();
    await expect(page.getByRole("cell", { name: scholarship.name })).toBeVisible();
    await expect(page).toHaveURL(/\/scholarships$/);
    await expect.poll(() => api.refreshRequests).toEqual([
      {
        authorization: null,
        body: { refresh: REFRESH_TOKEN },
      },
    ]);
    await expect.poll(() => api.listAuthorization).toBe(
      `Bearer ${RENEWED_ACCESS_TOKEN}`
    );

    await expect
      .poll(() =>
        page.evaluate(() => ({
          access: localStorage.getItem("token"),
          refresh: localStorage.getItem("refreshToken"),
          autoLogin: localStorage.getItem("autoLogin"),
        }))
      )
      .toEqual({
        access: RENEWED_ACCESS_TOKEN,
        refresh: REFRESH_TOKEN,
        autoLogin: "true",
      });
  });

  test("token 갱신이 거부되면 토큰을 제거하고 로그인으로 이동한다", async ({ page }) => {
    const api = await mockSessionApi(page, { refreshSucceeds: false });
    await seedExpiredAutoLoginSession(page);

    await page.goto("/scholarships");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
    await expect.poll(() => api.refreshRequests).toHaveLength(1);
    expect(api.scholarshipListRequests).toBe(0);
    await expect
      .poll(() =>
        page.evaluate(() => ({
          access: localStorage.getItem("token"),
          refresh: localStorage.getItem("refreshToken"),
        }))
      )
      .toEqual({ access: null, refresh: null });
  });
});

async function seedExpiredAutoLoginSession(page) {
  await page.addInitScript(
    ({ access, refresh }) => {
      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("autoLogin", "true");
    },
    { access: EXPIRED_ACCESS_TOKEN, refresh: REFRESH_TOKEN }
  );
}

async function mockSessionApi(page, { refreshSucceeds }) {
  const state = {
    listAuthorization: null,
    refreshRequests: [],
    scholarshipListRequests: 0,
  };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (!path.startsWith("/api/")) {
      await route.continue();
      return;
    }

    if (request.method() === "POST" && path === "/api/auth/jwt/refresh/") {
      state.refreshRequests.push({
        authorization: request.headers().authorization ?? null,
        body: request.postDataJSON(),
      });
      await route.fulfill({
        status: refreshSucceeds ? 200 : 401,
        contentType: "application/json",
        body: JSON.stringify(
          refreshSucceeds
            ? { access: RENEWED_ACCESS_TOKEN }
            : { detail: "Token is invalid or expired" }
        ),
      });
      return;
    }

    if (request.method() === "GET" && path === "/api/scholarships/") {
      state.scholarshipListRequests += 1;
      state.listAuthorization = request.headers().authorization ?? null;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 1, results: [scholarship] }),
      });
      return;
    }

    if (request.method() === "GET" && path === "/api/scholarships/wishlist/") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
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

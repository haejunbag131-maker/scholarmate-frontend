import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const ACCESS_TOKEN = createToken({
  user_id: 2,
  username: "receiver",
  exp: 4_102_444_800,
});

const conversation = {
  id: 42,
  participants: [
    { id: 1, username: "sender" },
    { id: 2, username: "receiver" },
  ],
  partner: { id: 1, username: "sender" },
  latest_message: "세 번째 쪽지",
  latest_time: "2026-06-30T09:00:00Z",
  unread_count: 3,
  participant_count: 2,
  created_at: "2026-06-30T08:00:00Z",
};

const incomingMessages = [1, 2, 3].map((id) => ({
  id,
  conversation: 42,
  sender: { id: 1, username: "sender" },
  content: `${id}번째 쪽지`,
  created_at: `2026-06-30T09:0${id}:00Z`,
  is_read: false,
}));

test("헤더 미읽음 수를 서버 집계값으로 표시하고 대화 진입 즉시 제거한다", async ({
  page,
}) => {
  const api = await mockMessageApi(page);
  await page.addInitScript((token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", "refresh-token");
  }, ACCESS_TOKEN);

  await page.goto("/messages");

  const inboxButton = page.getByRole("button", {
    name: "쪽지함(미읽음 3개)",
  });
  await expect(inboxButton).toBeVisible();
  await inboxButton.click();

  await page
    .getByRole("button", { name: "sender님과의 쪽지 열기" })
    .click();

  await expect(page).toHaveURL(/\/messages\/42$/);
  await expect.poll(() => api.markReadRequests).toBe(1);
  await expect(
    page.getByRole("button", { name: "쪽지함(미읽음 0개)" })
  ).toBeVisible();

  api.releaseMarkRead();
  await expect.poll(() => api.markReadCompleted).toBe(1);
  await expect(
    page.getByRole("button", { name: "쪽지함(미읽음 0개)" })
  ).toBeVisible();
});

async function mockMessageApi(page) {
  let releaseMarkRead;
  const markReadGate = new Promise((resolve) => {
    releaseMarkRead = resolve;
  });
  const state = {
    markReadCompleted: 0,
    markReadRequests: 0,
    releaseMarkRead,
  };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (!path.startsWith("/api/")) {
      await route.continue();
      return;
    }

    if (request.method() === "GET" && path === "/api/auth/users/me/") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: 2, username: "receiver" }),
      });
      return;
    }

    if (
      request.method() === "GET" &&
      path === "/api/community/conversations/"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 1, results: [conversation] }),
      });
      return;
    }

    if (
      request.method() === "GET" &&
      path === "/api/community/conversations/42/"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(conversation),
      });
      return;
    }

    if (request.method() === "GET" && path === "/api/community/messages/") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 3, results: incomingMessages }),
      });
      return;
    }

    if (
      request.method() === "POST" &&
      path === "/api/community/conversations/42/mark_read/"
    ) {
      state.markReadRequests += 1;
      await markReadGate;
      state.markReadCompleted += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ marked: 3 }),
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

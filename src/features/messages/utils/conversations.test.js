import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dedupeConversations,
  getConversationUnreadCount,
} from "./conversations.js";

describe("conversation unread helpers", () => {
  it("normalizes unread counts amplified by participant joins", () => {
    assert.equal(
      getConversationUnreadCount({ unread_count: 6, participant_count: 2 }),
      3
    );
  });

  it("keeps ordinary unread counts when no participant multiplier exists", () => {
    assert.equal(getConversationUnreadCount({ unread_count: 3 }), 3);
    assert.equal(getConversationUnreadCount({ unread_count: null }), 0);
  });

  it("keeps only one row for each conversation id", () => {
    assert.deepEqual(
      dedupeConversations([
        { id: 10, unread_count: 6 },
        { id: 10, unread_count: 6 },
        { id: 20, unread_count: 0 },
      ]).map((conversation) => conversation.id),
      [10, 20]
    );
  });
});

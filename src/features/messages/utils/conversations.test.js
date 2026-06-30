import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dedupeConversations,
  getConversationUnreadCount,
} from "./conversations.js";

describe("conversation unread helpers", () => {
  it("uses the unread count returned by the API", () => {
    assert.equal(getConversationUnreadCount({ unread_count: 3 }), 3);
    assert.equal(
      getConversationUnreadCount({ unread_count: 4, participant_count: 2 }),
      4
    );
  });

  it("normalizes invalid unread counts to zero", () => {
    assert.equal(getConversationUnreadCount({ unread_count: null }), 0);
    assert.equal(getConversationUnreadCount({ unread_count: -1 }), 0);
  });

  it("keeps only one row for each conversation id", () => {
    assert.deepEqual(
      dedupeConversations([
        { id: 10, unread_count: 3 },
        { id: 10, unread_count: 3 },
        { id: 20, unread_count: 0 },
      ]).map((conversation) => conversation.id),
      [10, 20]
    );
  });
});

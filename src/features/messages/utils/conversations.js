export const CONVERSATION_READ_EVENT = "scholarmate:conversation-read";

const toNonNegativeInteger = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.floor(number);
};

export function getConversationUnreadCount(conversation) {
  return toNonNegativeInteger(
    conversation?.unread_count ?? conversation?.unread
  );
}

export function dedupeConversations(conversations) {
  const unique = new Map();
  const withoutId = [];

  for (const conversation of conversations) {
    const id = conversation?.id ?? conversation?.conversation_id;
    if (id === null || id === undefined) {
      withoutId.push(conversation);
      continue;
    }

    const key = String(id);
    if (!unique.has(key)) unique.set(key, conversation);
  }

  return [...unique.values(), ...withoutId];
}

export function notifyConversationRead(conversationId) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CONVERSATION_READ_EVENT, {
      detail: { conversationId: String(conversationId) },
    })
  );
}

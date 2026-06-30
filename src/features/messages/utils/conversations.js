export const CONVERSATION_READ_EVENT = "scholarmate:conversation-read";

const toNonNegativeInteger = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.floor(number);
};

export function getConversationUnreadCount(conversation) {
  const rawCount = toNonNegativeInteger(
    conversation?.unread_count ?? conversation?.unread
  );
  const participantCount = toNonNegativeInteger(
    conversation?.participant_count
  );

  // The current API annotation joins messages and participants, so a 1:1
  // conversation reports each unread message once per participant.
  if (participantCount > 1 && rawCount % participantCount === 0) {
    return rawCount / participantCount;
  }

  return rawCount;
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

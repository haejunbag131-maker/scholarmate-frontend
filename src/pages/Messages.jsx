import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listMessages, sendMessage as sendMessageApi } from "../api/community";
import { Button, Input, Empty, message as antdMessage } from "antd";
import api from "../api/axios";
import PageShell from "../shared/components/PageShell";
import PageTitle from "../shared/components/PageTitle";
import { SkeletonList } from "../shared/components/Skeleton";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

const hasValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const pickFirstValue = (...values) => values.find(hasValue) ?? null;

const normalizeIdentity = (value) => String(value ?? "").trim().toLowerCase();

const getUserId = (user) => {
  if (!user) return null;
  if (typeof user === "object") {
    return pickFirstValue(user.id, user.pk, user.user_id, user.userId);
  }
  return hasValue(user) ? user : null;
};

const getUserUsername = (user) => {
  if (!user) return null;
  if (typeof user === "object") {
    return pickFirstValue(user.username, user.name, user.nickname);
  }
  return typeof user === "string" && hasValue(user) ? user : null;
};

const getMessageSenderId = (message) =>
  pickFirstValue(
    getUserId(message?.sender),
    getUserId(message?.author),
    getUserId(message?.user),
    getUserId(message?.from_user),
    getUserId(message?.fromUser),
    getUserId(message?.created_by),
    message?.sender_id,
    message?.senderId,
    message?.author_id,
    message?.authorId,
    message?.user_id,
    message?.userId,
    message?.from_user_id,
    message?.fromUserId,
    message?.created_by_id,
    message?.createdById
  );

const getMessageSenderName = (message) =>
  pickFirstValue(
    getUserUsername(message?.sender),
    getUserUsername(message?.author),
    getUserUsername(message?.user),
    getUserUsername(message?.from_user),
    getUserUsername(message?.fromUser),
    getUserUsername(message?.created_by),
    message?.sender_username,
    message?.senderUsername,
    message?.author_username,
    message?.authorUsername,
    message?.user_username,
    message?.userUsername,
    message?.from_username,
    message?.fromUsername,
    message?.username
  );

const getMessageContent = (message) => {
  if (!message) return "";
  if (typeof message === "string") return message;
  return message.content ?? message.body ?? message.text ?? "";
};

const getMessageCreatedAt = (message) =>
  message?.created_at ??
  message?.createdAt ??
  message?.sent_at ??
  message?.sentAt ??
  message?.timestamp ??
  "";

const toTimestamp = (value) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getMessageMergeKey = (message) => {
  if (hasValue(message?.id)) return `id:${message.id}`;
  if (hasValue(message?.client_id)) return `client:${message.client_id}`;
  if (hasValue(message?.clientId)) return `client:${message.clientId}`;
  return [
    "fallback",
    getMessageSenderId(message) ?? getMessageSenderName(message) ?? "",
    getMessageCreatedAt(message),
    getMessageContent(message),
  ].join(":");
};

// 병합 유틸 (중복 제거 + 최신화)
function mergeMessages(prev, next) {
  const map = new Map();
  prev.forEach((m) => map.set(getMessageMergeKey(m), { ...m }));
  next.forEach((n) => {
    const key = getMessageMergeKey(n);
    const old = map.get(key);
    map.set(key, {
      ...(old || {}),
      ...n,
      __mine: Boolean(old?.__mine || n.__mine || n.__optimistic),
    });
  });
  const arr = Array.from(map.values());
  arr.sort((a, b) => toTimestamp(getMessageCreatedAt(a)) - toTimestamp(getMessageCreatedAt(b)));
  return arr;
}

const formatMessageTime = (value) => {
  const timestamp = toTimestamp(value);
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDateSeparator = (value) => {
  const timestamp = toTimestamp(value);
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

const isSameDay = (a, b) => {
  const first = toTimestamp(a);
  const second = toTimestamp(b);
  if (!first || !second) return false;
  const firstDate = new Date(first);
  const secondDate = new Date(second);
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
};

const isNearBottom = (element, threshold = 32) => {
  if (!element) return true;
  return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
};

const scrollElementToBottom = (element, behavior = "auto") => {
  if (!element) return;
  const top = Math.max(element.scrollHeight - element.clientHeight, 0);
  if (typeof element.scrollTo === "function") {
    element.scrollTo({ top, behavior });
    return;
  }
  element.scrollTop = top;
};

const getMessageSignature = (message) =>
  [
    getMessageMergeKey(message),
    getMessageContent(message),
    getMessageCreatedAt(message),
    getMessageSenderId(message) ?? "",
    getMessageSenderName(message) ?? "",
    Boolean(message?.__mine),
    Boolean(message?.__optimistic),
    Boolean(message?.is_read),
  ].join("\u001f");

const areMessageListsEqual = (prev, next) =>
  prev.length === next.length &&
  prev.every((message, index) => getMessageSignature(message) === getMessageSignature(next[index]));

const getMessageLayoutSignature = (message) =>
  [
    getMessageMergeKey(message),
    getMessageContent(message),
    getMessageCreatedAt(message),
    getMessageSenderId(message) ?? "",
    getMessageSenderName(message) ?? "",
    Boolean(message?.__mine),
    Boolean(message?.__optimistic),
  ].join("\u001f");

const areMessageLayoutsEqual = (prev, next) =>
  prev.length === next.length &&
  prev.every(
    (message, index) => getMessageLayoutSignature(message) === getMessageLayoutSignature(next[index])
  );

const getConversationPartnerNames = (conversation, me) => {
  if (conversation?.partner?.username) return [conversation.partner.username];

  if (Array.isArray(conversation?.other_usernames)) {
    return conversation.other_usernames.filter(Boolean);
  }

  const participants = Array.isArray(conversation?.participants)
    ? conversation.participants
    : [];

  const otherParticipants = participants.filter((participant) => {
    if (me.id != null && participant?.id != null) {
      return Number(participant.id) !== Number(me.id);
    }
    if (me.username && participant?.username) {
      return participant.username !== me.username;
    }
    return true;
  });

  return otherParticipants.map((participant) => participant.username).filter(Boolean);
};

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [me, setMe] = useState({ id: null, username: null });
  const [meReady, setMeReady] = useState(false);
  const [conversationSummary, setConversationSummary] = useState({
    title: "쪽지",
  });

  const inFlight = useRef(false);
  const listRef = useRef(null);
  const activeConversationRef = useRef(null);
  const summaryConversationRef = useRef(null);
  const latestMsgsRef = useRef([]);
  const pendingScrollRef = useRef(null);

  // 스크롤 
  const scrollToBottom = useCallback((behavior = "auto") => {
    scrollElementToBottom(listRef.current, behavior);
  }, []);

  useLayoutEffect(() => {
    latestMsgsRef.current = msgs;

    const pending = pendingScrollRef.current;
    if (!pending) return;

    pendingScrollRef.current = null;
    const el = listRef.current;
    if (!el) return;

    if (pending.stickToBottom) {
      scrollElementToBottom(el, pending.behavior);
    } else {
      const diff = el.scrollHeight - pending.prevScrollHeight;
      el.scrollTop = pending.prevScrollTop + diff;
    }

    if (pending.windowScroll && typeof window !== "undefined") {
      window.scrollTo(pending.windowScroll.x, pending.windowScroll.y);
    }
  });

  const applyConversationSummary = useCallback((conversation) => {
    const names = getConversationPartnerNames(conversation, me);
    const title = names.length ? `${names.join(", ")}님과의 쪽지` : "쪽지";
    setConversationSummary({
      title,
    });
  }, [me]);

  const loadConversationSummary = useCallback(async () => {
    if (!conversationId) return;

    try {
      const { data } = await api.get(`/community/conversations/${conversationId}/`, {
        skipAuthRedirect: true,
      });
      applyConversationSummary(data);
    } catch {
      try {
        const { data } = await api.get("/community/conversations/", {
          params: { page_size: 100, ordering: "-latest_time" },
          skipAuthRedirect: true,
        });
        const list = Array.isArray(data) ? data : data?.results ?? [];
        const currentConversation = list.find(
          (conversation) => String(conversation.id) === String(conversationId)
        );
        if (currentConversation) applyConversationSummary(currentConversation);
      } catch {
        // 제목 보조 정보 조회 실패 시 기본 제목으로 표시합니다.
      }
    }
  }, [applyConversationSummary, conversationId]);

  // 자신인지 판별
  const isMineMessage = useCallback((m) => {
    if (!m) return false;
    if (m.__mine || m.__optimistic) return true;

    const explicitMine =
      m.is_mine ?? m.isMine ?? m.mine ?? m.sent_by_me ?? m.sentByMe;
    if (explicitMine === true) return true;

    const myId = pickFirstValue(me.id, me.user_id, me.userId);
    const senderId = getMessageSenderId(m);
    if (hasValue(myId) && hasValue(senderId)) {
      return normalizeIdentity(myId) === normalizeIdentity(senderId);
    }

    const senderName = getMessageSenderName(m);
    if (hasValue(me.username) && hasValue(senderName)) {
      return normalizeIdentity(me.username) === normalizeIdentity(senderName);
    }

    return false;
  }, [me]);

  const tagMine = useCallback(
    (msg) => ({ ...msg, __mine: Boolean(msg.__mine || msg.__optimistic || isMineMessage(msg)) }),
    [isMineMessage]
  );

  // 자신 
  useEffect(() => {
    let mounted = true;
    (async () => {
      let myId = null,
        myUsername = null;
      const tok = localStorage.getItem("token");
      if (tok) {
        const p = parseJwt(tok);
        myId = p?.user_id ?? p?.id ?? null;
        myUsername = p?.username ?? null;
      }
      if (!myUsername) {
        try {
          const { data } = await api.get("/auth/users/me/");
          myUsername = data?.username ?? myUsername;
          myId = data?.id ?? myId;
        } catch {
          // 사용자 정보 조회 실패 시 토큰/로컬 정보로 계속 진행합니다.
        }
      }
      if (!myUsername) myUsername = localStorage.getItem("username") || null;

      if (mounted) {
        setMe({ id: myId, username: myUsername });
        setMeReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!meReady) return;
    setMsgs((prev) => {
      const next = prev.map(tagMine);
      return areMessageListsEqual(prev, next) ? prev : next;
    });
  }, [meReady, tagMine]);

  useEffect(() => {
    if (!meReady) return;
    if (summaryConversationRef.current !== String(conversationId)) {
      summaryConversationRef.current = String(conversationId);
      setConversationSummary({ title: "쪽지" });
    }
    loadConversationSummary();
  }, [conversationId, loadConversationSummary, meReady]);

  // 읽음 처리 
  const markRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await api.post(`/community/conversations/${conversationId}/mark_read/`);
      setMsgs((prev) => {
        let changed = false;
        const next = prev.map((m) => {
          if (isMineMessage(m) || m.is_read) return m;
          changed = true;
          return { ...m, is_read: true };
        });
        return changed ? next : prev;
      });
    } catch {
      // 읽음 처리 실패는 메시지 표시를 막지 않습니다.
    }
  }, [conversationId, isMineMessage]);

  // 로드
  const load = useCallback(
    async (mode = "init", { force = false, replace = false } = {}) => {
      if (!conversationId) return;
      if (inFlight.current && !force) return;
      inFlight.current = true;

      const firstLoad = mode === "init";
      if (firstLoad) setLoading(true);

      const el = listRef.current;
      const prevScrollHeight = el?.scrollHeight || 0;
      const prevScrollTop = el?.scrollTop || 0;
      const wasAtBottom = isNearBottom(el);
      const previousWindowScroll =
        typeof window === "undefined"
          ? null
          : { x: window.scrollX, y: window.scrollY };

      try {
        const m = await listMessages(Number(conversationId), {
          page: 1,
          pageSize: 200,
          ordering: "created_at",
        });
        const next = (Array.isArray(m) ? m : []).map(tagMine);
        const currentMessages = latestMsgsRef.current;
        const previewMerged = replace ? next : mergeMessages(currentMessages, next);
        const layoutChanged = !areMessageLayoutsEqual(currentMessages, previewMerged);
        const shouldAdjustScroll = firstLoad || mode === "afterSend" || layoutChanged;

        if (shouldAdjustScroll) {
          pendingScrollRef.current = {
            behavior: firstLoad || mode === "poll" ? "auto" : "smooth",
            prevScrollHeight,
            prevScrollTop,
            stickToBottom: firstLoad || mode === "afterSend" || wasAtBottom,
            windowScroll: mode === "poll" ? previousWindowScroll : null,
          };
        } else {
          pendingScrollRef.current = null;
        }

        setMsgs((prev) => {
          const merged = replace ? next : mergeMessages(prev, next);
          return areMessageListsEqual(prev, merged) ? prev : merged;
        });
        await markRead();
      } catch (e) {
        console.error(e);
        antdMessage.error("쪽지를 불러오지 못했습니다.");
      } finally {
        if (firstLoad) setLoading(false);
        inFlight.current = false;
      }
    },
    [conversationId, markRead, tagMine]
  );

  // polling & 대화방 전환 
  useEffect(() => {
    if (!conversationId || !meReady) return;

    const nextConversationId = String(conversationId);
    const isConversationChanged = activeConversationRef.current !== nextConversationId;

    if (isConversationChanged) {
      activeConversationRef.current = nextConversationId;
      setMsgs([]);
      setLoading(true);
      inFlight.current = false;
      load("init", { force: true, replace: true });
    }

    const t = setInterval(() => load("poll"), 5000);
    return () => clearInterval(t);
  }, [conversationId, load, meReady]);

  // 보내기 
  const send = async () => {
    const body = text.trim();
    if (!body || !conversationId || sending) return;

    const optimistic = {
      id: `tmp-${Date.now()}`,
      content: body,
      created_at: new Date().toISOString(),
      sender: { id: me.id, username: me.username || "나" },
      __optimistic: true,
      __mine: true,
      is_read: false,
    };

    setMsgs((prev) => mergeMessages(prev, [optimistic]));
    setText("");
    setTimeout(() => scrollToBottom("smooth"), 0);

    try {
      setSending(true);
      const res = await sendMessageApi({
        conversationId: Number(conversationId),
        content: body,
      });
      if (res && res.id) {
        const real = tagMine({ ...res, __mine: true });
        setMsgs((prev) =>
          mergeMessages(
            prev.filter((m) => m.id !== optimistic.id),
            [{ ...real, __mine: true }]
          )
        );
      }
      await load("afterSend", { force: true });
    } catch (e) {
      console.error(e);
      setMsgs((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(body);
      antdMessage.error(
        e?.response?.status === 401
          ? "로그인이 필요합니다."
          : "상대방이 대화방을 나갔습니다."
      );
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isMine = (m) => Boolean(m.__mine || isMineMessage(m));
  const messagePartnerNames = Array.from(
    new Set(
      msgs
        .filter((message) => !isMine(message))
        .map((message) => getMessageSenderName(message))
        .filter(Boolean)
    )
  );
  const conversationTitle =
    conversationSummary.title !== "쪽지"
      ? conversationSummary.title
      : messagePartnerNames.length
        ? `${messagePartnerNames.join(", ")}님과의 쪽지`
        : "쪽지";

  return (
    <PageShell width="narrow">
      <PageTitle>{conversationTitle}</PageTitle>
      <section
        aria-label={conversationTitle}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-900">
              1:1 쪽지
            </span>
          </div>
          <Button
            size="small"
            onClick={() => navigate("/messages")}
            className="!border-slate-300 !bg-white !text-slate-900 hover:!border-slate-500"
          >
            쪽지함
          </Button>
        </div>

        <div
          ref={listRef}
          className="h-[62vh] min-h-[360px] max-h-[640px] overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6"
          style={{ overflowAnchor: "none" }}
        >
          {loading && msgs.length === 0 ? (
            <SkeletonList rows={4} />
          ) : msgs.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Empty description="메시지가 없습니다." />
            </div>
          ) : (
            <div className="space-y-2.5">
              {msgs.map((m, index) => {
              const mine = isMine(m);
              const previous = msgs[index - 1];
              const createdAt = getMessageCreatedAt(m);
              const previousCreatedAt = previous ? getMessageCreatedAt(previous) : "";
              const showDate = !previous || !isSameDay(createdAt, previousCreatedAt);
              const senderName = getMessageSenderName(m) || "알 수 없음";
              const previousSenderName = previous ? getMessageSenderName(previous) : "";
              const showSender =
                !mine &&
                (showDate ||
                  !previous ||
                  isMine(previous) ||
                  normalizeIdentity(senderName) !== normalizeIdentity(previousSenderName));
              const deliveryText = m.__optimistic
                ? "전송 중"
                : m.is_read
                  ? "읽음"
                  : "전송됨";

              return (
                <Fragment key={`${getMessageMergeKey(m)}-${index}`}>
                  {showDate && (
                    <div className="flex justify-center py-2">
                      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {formatDateSeparator(createdAt)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex max-w-[82%] flex-col sm:max-w-[70%] ${
                        mine ? "items-end" : "items-start"
                      }`}
                    >
                      {showSender && (
                        <div className="mb-1 ml-1 text-xs font-bold text-slate-700">
                          {senderName}
                        </div>
                      )}

                      <div
                        className={`flex items-end gap-1.5 ${
                          mine ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[15px] leading-6 shadow-sm [overflow-wrap:anywhere] ${
                            mine
                              ? "rounded-tr-md bg-slate-900 text-white"
                              : "rounded-tl-md bg-white text-slate-900"
                          }`}
                        >
                          {getMessageContent(m)}
                        </div>

                        <div
                          className={`mb-1 flex shrink-0 flex-col gap-0.5 text-[11px] leading-tight text-slate-600 ${
                            mine ? "items-end" : "items-start"
                          }`}
                        >
                          {mine && (
                            <span className="font-semibold text-slate-700">
                              {deliveryText}
                            </span>
                          )}
                          <span>{formatMessageTime(createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
            </div>
          )}
        </div>

        <form
          className="flex items-end gap-2 border-t border-slate-200 bg-white p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 5 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="메시지 입력 (Enter 전송, Shift+Enter 줄바꿈)"
            className="!rounded-lg !border-slate-300 !py-2.5"
          />
          <Button
            htmlType="submit"
            type="primary"
            loading={sending}
            disabled={!text.trim() || sending}
            className="black-action-button !h-11 min-w-[72px] shrink-0"
            style={{ color: "#fff" }}
          >
            전송
          </Button>
        </form>
      </section>
    </PageShell>
  );
}

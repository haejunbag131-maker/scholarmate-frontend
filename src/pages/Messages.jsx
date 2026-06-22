import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listMessages, sendMessage as sendMessageApi } from "../api/community";
import { Button, Input, Card, Empty, message as antdMessage } from "antd";
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

// 병합 유틸 (중복 제거 + 최신화)
function mergeMessages(prev, next) {
  const map = new Map();
  prev.forEach((m) => map.set(m.id, { ...m }));
  next.forEach((n) => {
    const old = map.get(n.id);
    map.set(n.id, {
      ...(old || {}),
      ...n,
      __mine: (old?.__mine ?? n.__mine) || false,
    });
  });
  const arr = Array.from(map.values());
  arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return arr;
}

const getMessageContent = (message) => {
  if (!message) return "";
  if (typeof message === "string") return message;
  return message.content ?? message.body ?? message.text ?? "";
};

const getConversationPreview = (conversation) =>
  getMessageContent(
    conversation?.latest_message ??
      conversation?.last_message ??
      conversation?.lastMessage ??
      ""
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
  const [conversationSummary, setConversationSummary] = useState({
    title: "쪽지",
    preview: "",
  });

  const meRef = useRef({ id: null, username: null });
  const inFlight = useRef(false);
  const listRef = useRef(null);
  const endRef = useRef(null);

  // 스크롤 
  const scrollToBottom = useCallback((behavior = "auto") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const applyConversationSummary = useCallback((conversation) => {
    const names = getConversationPartnerNames(conversation, meRef.current);
    const title = names.length ? `${names.join(", ")}님과의 쪽지` : "쪽지";
    setConversationSummary({
      title,
      preview: getConversationPreview(conversation),
    });
  }, []);

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
        meRef.current = { id: myId, username: myUsername };
        loadConversationSummary();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadConversationSummary]);

  useEffect(() => {
    setConversationSummary({ title: "쪽지", preview: "" });
    loadConversationSummary();
  }, [conversationId, loadConversationSummary]);

  // 자신인지 판별 
  const isMineMessage = useCallback((m) => {
    if (m.__mine || m.__optimistic) return true;
    const myU = meRef.current.username;
    const myId = meRef.current.id;
    const u = m.sender?.username ?? m.author?.username ?? m.username ?? "";
    const sid = m.sender?.id ?? m.author?.id ?? null;
    if (myId && sid) return String(myId) === String(sid);
    if (myU && u) return u === myU;
    return false;
  }, []);
  const tagMine = useCallback((msg) => ({ ...msg, __mine: isMineMessage(msg) }), [isMineMessage]);

  // 읽음 처리 
  const markRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await api.post(`/community/conversations/${conversationId}/mark_read/`);
      setMsgs((prev) =>
        prev.map((m) => (m.__mine ? m : { ...m, is_read: true }))
      );
    } catch {
      // 읽음 처리 실패는 메시지 표시를 막지 않습니다.
    }
  }, [conversationId]);

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

      try {
        const m = await listMessages(Number(conversationId), {
          page: 1,
          pageSize: 200,
          ordering: "created_at",
        });
        const next = (Array.isArray(m) ? m : []).map(tagMine);

        setMsgs((prev) => (replace ? next : mergeMessages(prev, next)));
        await markRead();

        if (firstLoad || mode === "afterSend") {
          setTimeout(() => scrollToBottom("auto"), 30);
        } else {
          setTimeout(() => {
            if (el) {
              const diff = el.scrollHeight - prevScrollHeight;
              el.scrollTop = prevScrollTop + diff;
            }
          }, 30);
        }
      } catch (e) {
        console.error(e);
        antdMessage.error("쪽지를 불러오지 못했습니다.");
      } finally {
        if (firstLoad) setLoading(false);
        inFlight.current = false;
      }
    },
    [conversationId, markRead, scrollToBottom, tagMine]
  );

  // polling & 대화방 전환 
  useEffect(() => {
    if (!conversationId) return;

    setMsgs([]);
    inFlight.current = false;
    load("init", { force: true, replace: true });

    const t = setInterval(() => load("poll"), 5000);
    return () => clearInterval(t);
  }, [conversationId, load]);

  // 보내기 
  const send = async () => {
    const body = text.trim();
    if (!body || !conversationId) return;

    const optimistic = {
      id: `tmp-${Date.now()}`,
      content: body,
      created_at: new Date().toISOString(),
      sender: { id: meRef.current.id, username: meRef.current.username || "나" },
      __optimistic: true,
      __mine: true,
      is_read: false,
    };

    setMsgs((prev) => mergeMessages(prev, [optimistic]));
    setText("");
    setTimeout(() => scrollToBottom("smooth"), 0);

    try {
      const res = await sendMessageApi({
        conversationId: Number(conversationId),
        content: body,
      });
      if (res && res.id) {
        const real = tagMine(res);
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
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isMine = (m) => m.__mine ?? isMineMessage(m);
  const messagePartnerNames = Array.from(
    new Set(
      msgs
        .filter((message) => !isMine(message))
        .map((message) => message.sender?.username ?? message.author?.username)
        .filter(Boolean)
    )
  );
  const conversationTitle =
    conversationSummary.title !== "쪽지"
      ? conversationSummary.title
      : messagePartnerNames.length
        ? `${messagePartnerNames.join(", ")}님과의 쪽지`
        : "쪽지";
  const latestMessagePreview =
    getMessageContent(msgs[msgs.length - 1]) || conversationSummary.preview;

  return (
    <PageShell width="narrow">
      <PageTitle>
        <span className="block">
          <span className="block">{conversationTitle}</span>
          {latestMessagePreview && (
            <span className="mx-auto mt-2 block max-w-2xl truncate text-sm font-medium leading-6 text-gray-500">
              {latestMessagePreview}
            </span>
          )}
        </span>
      </PageTitle>
      <Card
        extra={
          <Button
            size="small"
            onClick={() => navigate("/messages")}
            className="!bg-gray-200 !border-gray-300"
          >
            쪽지함으로 이동
          </Button>
        }
      >
        <div ref={listRef} className="space-y-3 max-h-[50vh] overflow-y-auto p-1">
          {loading && msgs.length === 0 ? (
            <SkeletonList rows={4} />
          ) : msgs.length === 0 ? (
            <Empty description="메시지가 없습니다." />
          ) : (
            msgs.map((m) => {
              const mine = isMine(m);
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div className={mine ? "text-right" : "text-left"}>
                    <div className="text-xs text-gray-400">
                      {(m.sender?.username ?? "알수없음")} ·{" "}
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : ""}
                      {!mine && !m.is_read && (
                        <span className="ml-1 w-1.5 h-1.5 bg-blue-500 inline-block rounded-full" />
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 rounded inline-block mt-1 whitespace-pre-wrap ${
                        mine ? "bg-black text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {m.content ?? ""}
                    </div>
                    {mine && (
                      <div className="mt-1 text-xs text-gray-500 flex justify-end">
                        {m.is_read ? "✓ 읽음" : "✓ 전송됨"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-4 flex gap-2">
          <Input.TextArea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="메시지 입력 (Enter 전송, Shift+Enter 줄바꿈)"
          />
          <Button
            type="primary"
            onClick={send}
            disabled={!text.trim()}
            className="black-action-button self-stretch !h-auto min-w-[80px] shrink-0"
            style={{ color: "#fff" }}
          >
            전송
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}

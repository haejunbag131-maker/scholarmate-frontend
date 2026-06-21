import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchMe } from "../api/user";
import PageShell from "../shared/components/PageShell";
import LoadingState from "../shared/components/LoadingState";

import { message, Empty } from "antd";

import {
  getPost,
  incView,
  listComments,
  addComment,
  ensureConversation,
  updateComment,
  deleteComment,
  addReply,
  updatePost,
  deletePost,
} from "../api/community";

import CommentSection from "../features/community/components/CommentSection";
import PostDetailCard from "../features/community/components/PostDetailCard";
import PostEditModal from "../features/community/components/PostEditModal";

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [replyOpen, setReplyOpen] = useState({}); // { [commentId]: true }

  const [postEditOpen, setPostEditOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  const viewedOnceRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const u = await fetchMe();
        setMe(u);
      } catch {
        setMe(null);
      }

      const p = await getPost(id);
      setPost(p);

      if (!viewedOnceRef.current) {
        viewedOnceRef.current = true;
        incView(id).catch(() => {});
      }

      const cs = await listComments({ postId: id });
      setComments(cs);
    } catch (e) {
      console.error(e);
      message.error("글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    viewedOnceRef.current = false;
    load();
  }, [id, load]);

  // 최상위 댓글 등록
  const submit = async () => {
    const value = text.trim();
    if (!value) return;
    setSending(true);
    try {
      const optimistic = {
        id: `tmp-${Date.now()}`,
        content: value,
        created_at: new Date().toISOString(),
        author: me ? { id: me.id, username: me.username } : { username: "나" },
        parent: null,
      };
      setComments((prev) => [optimistic, ...prev]);
      setText("");

      await addComment({ postId: Number(id), content: value });
      const cs = await listComments({ postId: id });
      setComments(cs);
    } catch (e) {
      console.error(e);
      message.error(
        e?.response?.status === 401 ? "로그인이 필요합니다." : "댓글 등록 실패"
      );
      setComments((prev) => prev.filter((c) => !String(c.id).startsWith("tmp-")));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  // 글(포스트) 정보
  const authorId =
    post?.author?.id ?? post?.author_id ?? post?.authorId ?? null;
  const authorUsername =
    post?.author?.username ?? post?.author_username ?? post?.username ?? null;

  const canEditPost =
    !!me &&
    ((authorId != null && Number(authorId) === Number(me.id)) ||
      (authorUsername && authorUsername === me.username));

  // DM
  const startDM = async () => {
    if (!authorId && !authorUsername) {
      message.warning("작성자 정보를 찾을 수 없습니다.");
      return;
    }
    if (me && authorId && Number(authorId) === Number(me.id)) {
      return; // 자기 자신이면 실행 X
    }

    try {
      const conv = await ensureConversation({
        recipientId: authorId ?? null,
        recipientUsername: authorUsername ?? null,
      });
      if (!conv?.id) {
        message.error("쪽지 대화 생성에 실패했습니다.");
        return;
      }
      navigate(`/messages/${conv.id}`);
    } catch (e) {
      console.error(e);
      const detail =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "";
      if (e?.response?.status === 401) {
        message.error("로그인이 필요합니다.");
      } else if (e?.response?.status === 400) {
        message.error(`요청 형식 오류: ${String(detail) || "잘못된 수신자"}`);
      } else {
        message.error("쪽지 시작 실패");
      }
    }
  };

  // 댓글/답글 수정/삭제
  const beginEdit = (c) => {
    setEditingId(c.id);
    setEditingText(c.content);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };
  const submitEdit = async () => {
    const value = editingText.trim();
    if (!value) return;
    try {
      await updateComment({ id: editingId, content: value });
      message.success("수정되었습니다.");
      setEditingId(null);
      setEditingText("");
      const cs = await listComments({ postId: id });
      setComments(cs);
    } catch (e) {
      console.error(e);
      message.error(
        e?.response?.status === 403 ? "수정 권한이 없습니다." : "수정 실패"
      );
    }
  };

  const removeComment = async (c) => {
    try {
      await deleteComment(c.id);
      message.success("삭제되었습니다.");
      setComments((prev) => prev.filter((x) => x.id !== c.id && x.parent !== c.id));
    } catch (e) {
      console.error(e);
      message.error(
        e?.response?.status === 403 ? "삭제 권한이 없습니다." : "삭제 실패"
      );
    }
  };

  const toggleReply = useCallback((commentId) => {
    const key = String(commentId);
    setReplyOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const closeReply = useCallback((commentId) => {
    const key = String(commentId);
    setReplyOpen((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // 답글(대댓글) 
  const submitReply = useCallback(
    async (parent, value, resetInput) => {
      try {
        await addReply({ postId: Number(id), parentId: parent.id, content: value });
        message.success("답글이 등록되었습니다.");
        resetInput?.();
        closeReply(parent.id);
        const cs = await listComments({ postId: id });
        setComments(cs);
      } catch (e) {
        console.error(e);
        message.error(
          e?.response?.status === 401 ? "로그인이 필요합니다." : "답글 등록 실패"
        );
      }
    },
    [id, closeReply]
  );

  // 포스트 수정/삭제
  const openPostEdit = () => {
    setPostTitle(post?.title || post?.scholarship_name || "");
    setPostContent(post?.content || "");
    setPostEditOpen(true);
  };

  const handleSavePost = async () => {
    const payload = { title: postTitle.trim(), content: postContent.trim() };
    if (!payload.title || !payload.content) {
      message.warning("제목과 내용을 모두 입력하세요.");
      return;
    }
    try {
      await updatePost(post.id, payload);
      message.success("글이 수정되었습니다.");
      setPostEditOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      message.error(
        e?.response?.status === 403 ? "수정 권한이 없습니다." : "글 수정 실패"
      );
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      message.success("글이 삭제되었습니다.");
      navigate("/community");
    } catch (e) {
      console.error(e);
      message.error(
        e?.response?.status === 403 ? "삭제 권한이 없습니다." : "글 삭제 실패"
      );
    }
  };

  return (
    <PageShell width="narrow">
      <Link
        className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--color-primary)_25%,#fff)] bg-[color-mix(in_srgb,var(--color-primary)_10%,#fff)] px-3 py-1.5 text-sm font-semibold text-[var(--color-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_16%,#fff)]"
        to="/community"
      >
        ← 목록으로
      </Link>

      {loading ? (
        <LoadingState
          className="mt-6"
          message="게시글을 불러오는 중..."
          minHeight="220px"
        />
      ) : !post ? (
        <div className="mt-6">
          <Empty description="글을 찾을 수 없습니다." />
        </div>
      ) : (
        <>
          <PostDetailCard
            post={post}
            me={me}
            authorId={authorId}
            authorUsername={authorUsername}
            canEditPost={canEditPost}
            onStartDM={startDM}
            onOpenEdit={openPostEdit}
            onDeletePost={handleDeletePost}
          />
          <CommentSection
            comments={comments}
            text={text}
            sending={sending}
            me={me}
            editingId={editingId}
            editingText={editingText}
            replyOpen={replyOpen}
            onTextChange={setText}
            onTextKeyDown={onKeyDown}
            onSubmitComment={submit}
            onEditingTextChange={setEditingText}
            onBeginEdit={beginEdit}
            onCancelEdit={cancelEdit}
            onSubmitEdit={submitEdit}
            onRemoveComment={removeComment}
            onToggleReply={toggleReply}
            onCancelReply={closeReply}
            onSubmitReply={submitReply}
          />
          <PostEditModal
            open={postEditOpen}
            title={postTitle}
            content={postContent}
            onTitleChange={setPostTitle}
            onContentChange={setPostContent}
            onCancel={() => setPostEditOpen(false)}
            onSave={handleSavePost}
          />
        </>
      )}
    </PageShell>
  );
}

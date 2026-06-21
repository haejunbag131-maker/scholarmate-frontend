import { Avatar, Button, Input, Popconfirm } from "antd";
import ReplyEditor from "./ReplyEditor";

const getCommentAuthor = (comment) => ({
  id: comment.author?.id ?? comment.author_id ?? comment.user?.id ?? null,
  username:
    comment.author?.username ??
    comment.author_username ??
    comment.username ??
    comment.user?.username ??
    null,
});

const isMyComment = (comment, me) => {
  if (!me) return false;

  const author = getCommentAuthor(comment);

  return (
    (author.id != null && Number(author.id) === Number(me.id)) ||
    (author.username && author.username === me.username)
  );
};

export default function CommentItem({
  comment,
  depth = 0,
  me,
  childrenMap,
  editingId,
  editingText,
  replyOpen,
  onEditingTextChange,
  onBeginEdit,
  onCancelEdit,
  onSubmitEdit,
  onRemoveComment,
  onToggleReply,
  onCancelReply,
  onSubmitReply,
}) {
  const author = getCommentAuthor(comment);
  const isMine = isMyComment(comment, me);
  const commentKey = String(comment.id);
  const isReplyOpen = !!replyOpen[commentKey];
  const childComments = childrenMap[commentKey] || [];

  return (
    <div className={`w-full ${depth ? "pl-6 border-l border-gray-200" : ""}`}>
      <div className="flex">
        <Avatar>{author.username?.[0]?.toUpperCase() || "U"}</Avatar>
        <div className="ml-3 flex-1">
          <div className="font-semibold">{author.username ?? "익명"}</div>
          {editingId === comment.id ? (
            <div className="mt-2 space-y-2">
              <Input.TextArea
                rows={2}
                value={editingText}
                onChange={(event) => onEditingTextChange(event.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  className="brand-action-button"
                  onClick={onSubmitEdit}
                >
                  저장
                </Button>
                <Button onClick={onCancelEdit}>취소</Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 whitespace-pre-wrap">{comment.content}</div>
          )}

          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="text-xs text-gray-400">
              {comment.created_at ? new Date(comment.created_at).toLocaleString() : ""}
            </span>
            <Button
              size="small"
              type="link"
              className="!p-0 !h-auto"
              onClick={() => onToggleReply(commentKey)}
            >
              {isReplyOpen ? "답글 취소" : "답글"}
            </Button>
            {isMine && (
              <>
                <Button
                  size="small"
                  type="link"
                  className="!p-0 !h-auto !text-[var(--color-primary)]"
                  onClick={() => onBeginEdit(comment)}
                >
                  수정
                </Button>
                <Popconfirm
                  title="삭제하시겠어요?"
                  okText="삭제"
                  cancelText="취소"
                  okButtonProps={{
                    danger: true,
                  }}
                  cancelButtonProps={{
                    className: "!border-gray-400 hover:!border-gray-600",
                  }}
                  onConfirm={() => onRemoveComment(comment)}
                >
                  <Button size="small" type="link" danger className="!p-0 !h-auto">
                    삭제
                  </Button>
                </Popconfirm>
              </>
            )}
          </div>

          {isReplyOpen && (
            <ReplyEditor
              onSubmit={(value, resetInput) =>
                onSubmitReply(comment, value, resetInput)
              }
              onCancel={() => onCancelReply(commentKey)}
            />
          )}
        </div>
      </div>

      {childComments.map((childComment) => (
        <CommentItem
          key={childComment.id}
          comment={childComment}
          depth={depth + 1}
          me={me}
          childrenMap={childrenMap}
          editingId={editingId}
          editingText={editingText}
          replyOpen={replyOpen}
          onEditingTextChange={onEditingTextChange}
          onBeginEdit={onBeginEdit}
          onCancelEdit={onCancelEdit}
          onSubmitEdit={onSubmitEdit}
          onRemoveComment={onRemoveComment}
          onToggleReply={onToggleReply}
          onCancelReply={onCancelReply}
          onSubmitReply={onSubmitReply}
        />
      ))}
    </div>
  );
}

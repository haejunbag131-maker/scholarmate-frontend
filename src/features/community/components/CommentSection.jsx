import { useMemo } from "react";
import { Button, Card, Empty, Input } from "antd";
import CommentItem from "./CommentItem";

export default function CommentSection({
  comments,
  text,
  sending,
  me,
  editingId,
  editingText,
  replyOpen,
  onTextChange,
  onTextKeyDown,
  onSubmitComment,
  onEditingTextChange,
  onBeginEdit,
  onCancelEdit,
  onSubmitEdit,
  onRemoveComment,
  onToggleReply,
  onCancelReply,
  onSubmitReply,
}) {
  const roots = useMemo(() => comments.filter((comment) => !comment.parent), [comments]);

  const childrenMap = useMemo(() => {
    const groupedComments = {};

    for (const comment of comments) {
      if (!comment.parent) continue;

      const key = String(comment.parent);
      (groupedComments[key] ||= []).push(comment);
    }

    return groupedComments;
  }, [comments]);

  return (
    <Card title={`댓글 ${comments.length}개`} className="mt-6">
      {comments.length === 0 ? (
        <Empty description="아직 댓글이 없습니다." />
      ) : (
        <div className="space-y-3">
          {roots.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
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
      )}

      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        <Input.TextArea
          rows={2}
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={onTextKeyDown}
          placeholder="댓글을 입력하세요 (Ctrl/⌘+Enter 전송)"
        />
        <Button
          onClick={onSubmitComment}
          loading={sending}
          className="black-action-button self-end sm:self-stretch sm:!h-auto sm:min-w-[76px]"
        >
          등록
        </Button>
      </div>
    </Card>
  );
}

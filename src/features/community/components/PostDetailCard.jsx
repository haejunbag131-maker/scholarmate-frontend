import { Avatar, Button, Card, Popconfirm, Tag } from "antd";

export default function PostDetailCard({
  post,
  me,
  authorId,
  authorUsername,
  canEditPost,
  onStartDM,
  onOpenEdit,
  onDeletePost,
}) {
  const canSendMessage =
    me && (!authorId || Number(authorId) !== Number(me.id));

  return (
    <Card className="mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-content-title">
          {post.title || post.scholarship_name}
        </h1>
        <div className="flex flex-wrap gap-2">
          {canSendMessage && (
            <Button
              className="black-action-button"
              onClick={onStartDM}
            >
              작성자에게 쪽지
            </Button>
          )}
          {canEditPost && (
            <>
              <Button
                className="brand-action-button"
                onClick={onOpenEdit}
              >
                수정
              </Button>
              <Popconfirm
                title="글을 삭제하시겠어요?"
                okText="삭제"
                cancelText="취소"
                okButtonProps={{
                  danger: true,
                }}
                cancelButtonProps={{
                  className: "!border-gray-400 hover:!border-gray-600",
                }}
                onConfirm={onDeletePost}
              >
                <Button danger>삭제</Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center mt-3">
        <Avatar>{(authorUsername || "U")[0].toUpperCase()}</Avatar>
        <div className="ml-3">
          <div className="font-semibold">{authorUsername || "익명"}</div>
          <div className="text-sm text-gray-500">
            {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
          </div>
        </div>
      </div>

      <div className="mt-5 whitespace-pre-wrap leading-7">{post.content}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(post.tags || []).map((tag, index) => (
          <Tag key={`${tag}-${index}`} color="blue">
            #{tag}
          </Tag>
        ))}
      </div>
    </Card>
  );
}

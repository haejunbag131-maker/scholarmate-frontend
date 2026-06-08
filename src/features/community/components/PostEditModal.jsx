import { Input, Modal } from "antd";

export default function PostEditModal({
  open,
  title,
  content,
  onTitleChange,
  onContentChange,
  onCancel,
  onSave,
}) {
  return (
    <Modal
      title="글 수정"
      open={open}
      onCancel={onCancel}
      onOk={onSave}
      okText="저장"
      cancelText="취소"
      okButtonProps={{
        className: "!bg-black !border-black !text-white hover:!bg-gray-800",
      }}
      cancelButtonProps={{
        className: "!border-gray-400 hover:!border-gray-600",
      }}
    >
      <div className="space-y-3">
        <Input
          placeholder="제목"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <Input.TextArea
          rows={8}
          placeholder="내용"
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
        />
      </div>
    </Modal>
  );
}

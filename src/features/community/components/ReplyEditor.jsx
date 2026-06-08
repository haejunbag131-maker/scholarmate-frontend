import { memo, useEffect, useRef, useState } from "react";
import { Button, Input } from "antd";

const ReplyEditor = memo(function ReplyEditor({
  onSubmit,
  onCancel,
  autoFocus = true,
}) {
  const [value, setValue] = useState("");
  const composingRef = useRef(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus?.();
  }, [autoFocus]);

  const submit = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    onSubmit(trimmedValue, () => setValue(""));
  };

  const handleKeyDown = (event) => {
    if (composingRef.current) return;
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="pl-12 pb-3">
      <Input.TextArea
        ref={inputRef}
        rows={2}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="답글을 입력하세요 (Ctrl/⌘+Enter 전송)"
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={() => {
          composingRef.current = false;
        }}
        onKeyDown={handleKeyDown}
      />
      <div className="mt-2 flex gap-2">
        <Button
          className="!bg-black !border-black !text-white hover:!bg-gray-800"
          onClick={submit}
        >
          등록
        </Button>
        <Button onClick={onCancel}>취소</Button>
      </div>
    </div>
  );
});

export default ReplyEditor;

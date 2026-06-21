import { useEffect, useState } from "react";
import { Form, Input, Select, message } from "antd";
import { createPost } from "../../api/community";
import Button from "../../shared/components/Button";
import Modal from "../../shared/components/Modal";

const { TextArea } = Input;

export default function PostComposeModal({
  open,
  onClose,
  onCreated,
  defaultCategory = "story",
}) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        category: defaultCategory,
        scholarship_name: "",
        title: "",
        content: "",
        tags: [],
      });
    }
  }, [open, defaultCategory, form]);

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      const payload = {
        category: values.category,
        scholarship_name: values.scholarship_name.trim(),
        title: values.title.trim(),
        content: values.content.trim(),
        tags: values.tags || [],
      };
      await createPost(payload);
      message.success("게시글이 등록되었습니다.");
      onClose?.();
      onCreated?.();
    } catch (e) {
      if (e?.errorFields) return;
      const msg = e?.response?.data?.detail || "등록에 실패했습니다.";
      message.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      title="새 글 작성"
      onClose={onClose}
      maxWidth="640px"
      topOffset={64}
      className="community-compose-modal"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button
            variant="primary"
            className="black-action-button"
            onClick={onSubmit}
            disabled={submitting}
          >
            등록
          </Button>
        </>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="category"
          label="글 유형"
          rules={[{ required: true, message: "글 유형을 선택하세요." }]}
        >
          <Select
            options={[
              { value: "story", label: "스토리(후기/노하우)" },
              { value: "feed", label: "피드(질문/짧은 글)" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="scholarship_name"
          label="장학금 이름 (필수)"
          rules={[
            { required: true, message: "장학금 이름을 입력하세요." },
            { min: 2, message: "장학금 이름은 2자 이상" },
          ]}
        >
          <Input placeholder="예) 국가장학금, 행복장학, 삼성꿈장학 등" />
        </Form.Item>

        <Form.Item
          name="title"
          label="제목"
          rules={[
            { required: true, message: "제목을 입력하세요." },
            { min: 2, message: "제목은 2자 이상" },
          ]}
        >
          <Input placeholder="제목" />
        </Form.Item>

        <Form.Item
          name="content"
          label="내용"
          rules={[{ required: true, message: "내용을 입력하세요." }]}
        >
          <TextArea rows={6} placeholder="경험, 준비 과정, 팁 등을 자유롭게 작성해 주세요." />
        </Form.Item>

        <Form.Item name="tags" label="태그 (엔터로 추가)">
          <Select mode="tags" tokenSeparators={[","]} placeholder="예) 자소서, 면접, 준비기간" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

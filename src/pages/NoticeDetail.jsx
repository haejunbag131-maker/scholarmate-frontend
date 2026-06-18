import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchNotice, updateNotice, deleteNotice } from "../api/notices";
import { fetchMe } from "../api/user";
import { queryKeys } from "../shared/queryKeys";
import { Spin, Empty, Button, Modal, Form, Input as AntInput, Switch, message } from "antd";

export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();
  const hasToken = Boolean(localStorage.getItem("token"));

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const noticeQuery = useQuery({
    queryKey: queryKeys.notices.detail(id),
    queryFn: () => fetchNotice(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ noticeId, values }) => updateNotice(noticeId, values),
    onSuccess: async () => {
      message.success("수정되었습니다.");
      setEditOpen(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notices.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notices.all,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: async () => {
      message.success("삭제되었습니다.");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notices.all,
      });
      navigate("/notice");
    },
  });

  const item = noticeQuery.data ?? null;
  const me = meQuery.data ?? null;
  const loading = noticeQuery.isPending;
  const saving = updateMutation.isPending;

  const openEdit = () => {
    if (!item) return;
    form.resetFields();
    form.setFieldsValue({
      title: item.title,
      content: item.content,
      is_pinned: item.is_pinned,
      is_published: item.is_published ?? true,
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    try {
      const values = await form.validateFields();
      await updateMutation.mutateAsync({ noticeId: item.id, values });
    } catch (e) {
      if (e?.errorFields) return;
      console.error(e);
      message.error(
        e?.response?.status === 403 ? "권한이 없습니다." : "수정에 실패했습니다."
      );
    }
  };

  const doDelete = async () => {
    Modal.confirm({
      title: "삭제하시겠어요?",
      content: "삭제 후 되돌릴 수 없습니다.",
      okText: "삭제",
      okButtonProps: { danger: true },
      cancelText: "취소",
      async onOk() {
        try {
          await deleteMutation.mutateAsync(item.id);
        } catch (e) {
          console.error(e);
          message.error("삭제에 실패했습니다.");
        }
      },
    });
  };

  return (
    <div className="mx-auto w-[min(calc(100vw-32px),900px)] pt-6 pb-6">
      <Link
        className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-[#0B2D6B] transition-colors hover:bg-blue-100"
        to="/notice"
      >
        ← 목록으로
      </Link>

      {loading ? (
        <div className="py-16 flex justify-center"><Spin /></div>
      ) : !item ? (
        <div className="py-16"><Empty description="해당 공지가 없습니다." /></div>
      ) : (
        <article className="mt-4 bg-white border border-gray-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm sm:shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              {item.is_pinned && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">고정</span>
              )}
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{item.title}</h1>
            </div>

            {me?.is_staff && (
              <div className="flex gap-2">
                <Button
                  className="!bg-black !border-black !text-white hover:!bg-gray-800"
                  onClick={openEdit}
                >
                  수정
                </Button>
                <Button danger loading={deleteMutation.isPending} onClick={doDelete}>삭제</Button>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {new Date(item.created_at).toLocaleString()}
            {typeof item.view_count === "number" && (
              <span className="ml-2 text-gray-400">조회 {item.view_count.toLocaleString()}회</span>
            )}
          </p>

          <div className="mt-6 whitespace-pre-wrap text-sm sm:text-base leading-6 sm:leading-7 text-gray-800">
            {item.content}
          </div>
        </article>
      )}

      <Modal
        title="공지 수정"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={submitEdit}
        okText="저장"
        confirmLoading={saving}
        destroyOnHidden
        okButtonProps={{ className: "!bg-black !border-black !text-white hover:!bg-gray-800" }}
        cancelButtonProps={{ className: "!border-gray-400 hover:!border-gray-600" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="제목"
            rules={[
              { required: true, message: "제목을 입력하세요." },
              { min: 2, message: "제목은 2자 이상 입력하세요." },
            ]}
          >
            <AntInput placeholder="제목" />
          </Form.Item>

          <Form.Item
            name="content"
            label="내용"
            rules={[{ required: true, message: "내용을 입력하세요." }]}
          >
            <AntInput.TextArea rows={6} placeholder="내용" />
          </Form.Item>

          <div className="flex gap-6">
            <Form.Item name="is_pinned" label="상단 고정" valuePropName="checked" className="mb-0">
              <Switch className="!border !border-black" />
            </Form.Item>
            <Form.Item name="is_published" label="공개" valuePropName="checked" className="mb-0">
              <Switch className="!border !border-black" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

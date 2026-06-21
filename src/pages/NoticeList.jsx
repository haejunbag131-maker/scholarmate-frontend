import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { fetchNotices, createNotice } from "../api/notices";
import { fetchMe } from "../api/user";
import PageShell from "../shared/components/PageShell";
import PageTitle from "../shared/components/PageTitle";
import SearchBox from "../shared/components/SearchBox";
import { SkeletonList } from "../shared/components/Skeleton";
import { queryKeys } from "../shared/queryKeys";

import {
  Pagination,
  Button,
  Empty,
  Modal,
  Form,
  Input as AntInput,
  Switch,
  message,
} from "antd";


export default function NoticeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const initialQuery = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("page_size") || 10)
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const hasToken = Boolean(localStorage.getItem("token"));

  const syncQuery = (next = {}) => {
    const params = new URLSearchParams({
      q: next.q ?? q,
      page: String(next.page ?? page),
      page_size: String(next.pageSize ?? pageSize),
    });
    setSearchParams(params);
  };

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const noticesQuery = useQuery({
    queryKey: queryKeys.notices.list({ q, page, pageSize }),
    queryFn: () => fetchNotices({ q, page, pageSize }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });

  const createNoticeMutation = useMutation({
    mutationFn: createNotice,
    onSuccess: async () => {
      message.success("등록되었습니다.");
      setModalOpen(false);
      setPage(1);
      syncQuery({ page: 1 });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notices.all,
      });
    },
  });

  const me = meQuery.data ?? null;
  const total = noticesQuery.data?.total ?? 0;
  const items = noticesQuery.data?.items ?? [];
  const loading = noticesQuery.isPending && !noticesQuery.data;
  const saving = createNoticeMutation.isPending;

  const onSearch = (value) => {
    const nextQuery = value.trim();
    setSearchInput(value);
    if (nextQuery === q && page === 1) return;
    setQ(nextQuery);
    setPage(1);
    syncQuery({ q: nextQuery, page: 1 });
  };

  const onChangePage = (p, ps) => {
    setPage(p);
    if (ps !== pageSize) setPageSize(ps);
    syncQuery({ page: p, pageSize: ps });
  };

  const onShowSizeChange = (_, ps) => {
    setPageSize(ps);
    setPage(1);
    syncQuery({ page: 1, pageSize: ps });
  };

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      title: "",
      content: "",
      is_pinned: false,
      is_published: true,
    });
    setModalOpen(true);
  };

  const submitCreate = async () => {
    try {
      const values = await form.validateFields();
      await createNoticeMutation.mutateAsync(values);
    } catch (e) {
      if (e?.errorFields) return;
      console.error(e);
      message.error(
        e?.response?.status === 403
          ? "권한이 없습니다. 관리자만 작성할 수 있어요."
          : "저장에 실패했습니다."
      );
    }
  };

  return (
    <PageShell width="medium">
      <PageTitle>공지사항</PageTitle>

      {/* 검색 + 총건수 + (관리자) 글쓰기 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <SearchBox
            value={searchInput}
            onChange={setSearchInput}
            onSearch={onSearch}
            placeholder="제목/내용 검색..."
            ariaLabel="공지사항 검색"
          />
        </div>

        <div className="flex items-center gap-2 sm:ml-3 justify-between sm:justify-end">
          <span className="text-sm text-gray-500">{total}건</span>
          {me?.is_staff && (
            <Button
              type="primary"
              onClick={openCreate}
              className="black-action-button"
            >
              글쓰기
            </Button>
          )}
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <SkeletonList rows={pageSize} className="rounded-lg border border-slate-100 bg-white px-4" />
      ) : noticesQuery.isError ? (
        <div className="py-12">
          <Empty description="공지사항을 불러오지 못했습니다." />
        </div>
      ) : items.length === 0 ? (
        <div className="py-12">
          <Empty description="공지사항이 없습니다." />
        </div>
      ) : (
        <ul className="grid gap-3 sm:divide-y sm:divide-gray-200 sm:border sm:rounded-lg sm:bg-white">
          {items.map((n) => (
            <li
              key={n.id}
              className="bg-white sm:bg-transparent sm:rounded-none sm:shadow-none 
                         p-4 sm:p-4 rounded-lg shadow-sm hover:bg-gray-50"
            >
              <Link to={`/notice/${n.id}`} className="block">
                <div className="flex items-center gap-2 mb-1">
                  {n.is_pinned && (
                    <span className="text-xs px-2 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,#fff)] text-[var(--color-secondary)]">
                      고정
                    </span>
                  )}
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">
                    {n.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* 페이지네이션 */}
      {total > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={onChangePage}
            showSizeChanger
            onShowSizeChange={onShowSizeChange}
            pageSizeOptions={["10", "20", "50"]}
            showTotal={(t, range) => `${range[0]}-${range[1]} / 총 ${t}건`}
          />
        </div>
      )}

      {/* 글쓰기 모달 (관리자 전용) */}
      <Modal
        title="새 공지 작성"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitCreate}
        confirmLoading={saving}
        okText="등록"
        destroyOnHidden
        okButtonProps={{
          className: "brand-action-button",
        }}
        cancelButtonProps={{
          className: "!border-gray-400 hover:!border-gray-600",
        }}
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
            <Form.Item
              name="is_pinned"
              label="상단 고정"
              valuePropName="checked"
              className="mb-0"
            >
              <Switch className="!border !border-[var(--color-primary)]" />
            </Form.Item>
            <Form.Item
              name="is_published"
              label="공개"
              valuePropName="checked"
              className="mb-0"
            >
              <Switch defaultChecked className="!border !border-[var(--color-primary)]" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </PageShell>
  );
}

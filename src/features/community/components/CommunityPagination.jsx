export default function CommunityPagination({
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) {
  if (loading || total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="sticky bottom-0 z-30 border-t bg-gray-50 py-3">
      <div className="flex flex-wrap items-center justify-center gap-2 px-4">
        <span className="text-sm text-gray-700">
          {start}-{end} / 총 {total}건
        </span>
        <button
          type="button"
          className="rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          onClick={() => onPageChange(Math.max(1, page - 1), pageSize)}
          disabled={page === 1}
        >
          이전
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          onClick={() => onPageChange(Math.min(totalPages, page + 1), pageSize)}
          disabled={page === totalPages}
        >
          다음
        </button>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-md border bg-white px-2 py-1.5 text-sm"
          aria-label="페이지당 게시글 수"
        >
          <option value={12}>12개씩</option>
          <option value={24}>24개씩</option>
          <option value={48}>48개씩</option>
        </select>
      </div>
    </div>
  );
}

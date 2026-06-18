import { getScholarshipUrl } from "../../../shared/utils/urls";

export default function RecommendationDetailModal({
  scholarship,
  favorites,
  headerPad,
  isFavoritePending,
  onClose,
  onToggleFavorite,
}) {
  const homepage = getScholarshipUrl(scholarship);
  const isFavorited = favorites.has(scholarship.product_id ?? scholarship.id);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 overflow-y-auto"
      style={{ paddingTop: headerPad + 24, paddingBottom: 24 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-6 relative"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recommendation-detail-title"
      >
        <button
          className="absolute right-4 top-3 text-sm font-bold text-gray-700 hover:text-black"
          onClick={onClose}
          aria-label="상세 정보 닫기"
        >
          닫기
        </button>

        <h2 id="recommendation-detail-title" className="text-xl sm:text-2xl font-bold mb-4">
          {scholarship.name} 상세 정보
        </h2>

        <div className="space-y-2 text-gray-800 max-h-[calc(100vh-200px)] overflow-y-auto text-sm sm:text-base">
          <p><strong>운영기관명:</strong> {scholarship.foundation_name}</p>
          <p><strong>모집 기간:</strong> {scholarship.recruitment_start} ~ {scholarship.recruitment_end}</p>
          <p><strong>성적기준:</strong> {scholarship.grade_criteria_details || "-"}</p>
          <p><strong>소득기준:</strong> {scholarship.income_criteria_details || "-"}</p>
          <p><strong>지원내역:</strong> {scholarship.support_details || "-"}</p>
          <p><strong>특정자격:</strong> {scholarship.specific_qualification_details || "-"}</p>
          <p><strong>지역거주여부:</strong> {scholarship.residency_requirement_details || "-"}</p>
          <p><strong>선발방법:</strong> {scholarship.selection_method_details || "-"}</p>
          <p><strong>선발인원:</strong> {scholarship.number_of_recipients_details || "-"}</p>
          <p><strong>자격제한:</strong> {scholarship.eligibility_restrictions || "-"}</p>
          <p><strong>제출서류:</strong> {scholarship.required_documents_details || "-"}</p>
          <p>
            <strong>홈페이지:</strong>{" "}
            {homepage ? (
              <a
                href={homepage}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 hover:text-blue-700"
              >
                이동하기
              </a>
            ) : (
              <span className="text-gray-500">주소 없음</span>
            )}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
          {homepage ? (
            <a
              href={homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 hover:text-white text-center"
            >
              홈페이지 보기
            </a>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed"
            >
              홈페이지 없음
            </button>
          )}

          <button
            onClick={() => onToggleFavorite(scholarship)}
            disabled={isFavoritePending}
            className="px-4 py-2 bg-gray-100 rounded-md border hover:bg-gray-200 text-center"
          >
            {isFavorited ? "관심 해제" : "관심 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

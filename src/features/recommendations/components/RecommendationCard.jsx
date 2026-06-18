import { FaHeart, FaRegHeart } from "react-icons/fa";
import { getScholarshipUrl } from "../../../shared/utils/urls";

export default function RecommendationCard({
  scholarship,
  isFavorited,
  isFavoritePending,
  onOpenDetail,
  onOpenReason,
  onToggleFavorite,
}) {
  const homepage = getScholarshipUrl(scholarship);

  return (
    <article className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-lg sm:text-2xl font-bold text-blue-700 mb-1 sm:mb-2">
            {scholarship.name}
          </h3>
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-semibold">운영기관명:</span> {scholarship.foundation_name}
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-semibold">모집 기간:</span>{" "}
            {scholarship.recruitment_start} ~ {scholarship.recruitment_end}
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 w-full md:w-auto">
          <button
            onClick={() => onOpenReason(scholarship)}
            className="w-full md:w-auto px-3 py-2 text-sm bg-white rounded-md border hover:bg-gray-50 text-center"
          >
            선별 이유
          </button>

          <button
            onClick={() => onOpenDetail(scholarship)}
            className="w-full md:w-auto px-3 py-2 text-sm bg-gray-100 rounded-md border hover:bg-gray-200 text-center"
          >
            상세보기
          </button>

          {homepage ? (
            <a
              href={homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-3 py-2 text-sm bg-sky-500 text-white rounded-md hover:bg-sky-600 hover:text-white text-center"
            >
              홈페이지
            </a>
          ) : (
            <button
              disabled
              className="w-full md:w-auto px-3 py-2 text-sm bg-gray-300 text-white rounded-md cursor-not-allowed text-center"
            >
              홈페이지 없음
            </button>
          )}

          <button
            onClick={() => onToggleFavorite(scholarship)}
            disabled={isFavoritePending}
            className="self-center border-0 bg-transparent p-1 text-xl leading-none shadow-none transition-transform hover:scale-110 disabled:opacity-50 md:self-auto"
            title={isFavorited ? "관심 해제" : "관심 등록"}
          >
            {isFavorited ? (
              <FaHeart className="h-5 w-5 text-rose-500" aria-hidden="true" />
            ) : (
              <FaRegHeart className="h-5 w-5 text-gray-500" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

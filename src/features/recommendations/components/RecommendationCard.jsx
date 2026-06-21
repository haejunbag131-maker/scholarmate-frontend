import { FaHeart, FaRegHeart } from "react-icons/fa";
import Button from "../../../shared/components/Button";
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
          <h3 className="mb-1 text-lg font-bold text-[var(--color-primary)] sm:mb-2 sm:text-2xl">
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
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => onOpenReason(scholarship)}
            className="md:w-auto"
          >
            선별 이유
          </Button>

          <Button
            variant="subtle"
            size="sm"
            fullWidth
            onClick={() => onOpenDetail(scholarship)}
            className="md:w-auto"
          >
            상세 보기
          </Button>

          {homepage ? (
            <Button
              as="a"
              href={homepage}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="sm"
              fullWidth
              className="md:w-auto"
            >
              홈페이지
            </Button>
          ) : (
            <Button disabled size="sm" fullWidth className="md:w-auto">
              홈페이지 없음
            </Button>
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

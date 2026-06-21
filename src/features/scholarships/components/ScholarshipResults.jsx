import {
  FaExternalLinkAlt,
  FaHeart,
  FaInfoCircle,
  FaRegHeart,
} from "react-icons/fa";
import Button from "../../../shared/components/Button";
import { getScholarshipUrl } from "../../../shared/utils/urls";
import { ScholarshipMobileCards, ScholarshipTable } from "./ScholarshipListViews";

export default function ScholarshipResults({
  scholarships,
  favorites,
  isFavoritePending,
  onOpenDetail,
  onToggleFavorite,
}) {
  const renderHomepageButton = (href, label = "홈페이지 보기", fullWidth = false) =>
    href ? (
      <Button
        as="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant="primary"
        size="sm"
        fullWidth={fullWidth}
      >
        {label}
      </Button>
    ) : (
      <Button disabled size="sm" fullWidth={fullWidth}>
        {fullWidth ? "없음" : "홈페이지 없음"}
      </Button>
    );

  const renderFavoriteButton = (item) => {
    const isFavorited = favorites.has(item.product_id);
    return (
      <button
        onClick={() => onToggleFavorite(item)}
        className="favorite-btn"
        disabled={isFavoritePending}
        title={isFavorited ? "관심 해제" : "관심 등록"}
        aria-label={isFavorited ? "관심 장학금 해제" : "관심 장학금 등록"}
      >
        {isFavorited ? (
          <FaHeart className="h-5 w-5 text-rose-500" aria-hidden="true" />
        ) : (
          <FaRegHeart className="h-5 w-5 text-gray-500" aria-hidden="true" />
        )}
      </button>
    );
  };

  const columns = [
    { header: "장학 재단명", render: (item) => item.foundation_name },
    { header: "장학 사업명", render: (item) => item.name },
    {
      header: "기간",
      render: (item) => `${item.recruitment_start} ~ ${item.recruitment_end}`,
    },
    {
      header: "상세/홈페이지",
      render: (item) => {
        const href = getScholarshipUrl(item);
        return (
          <div className="scholarship-actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenDetail(item)}
            >
              상세 보기
            </Button>
            {renderHomepageButton(href)}
          </div>
        );
      },
    },
    { header: "찜", render: renderFavoriteButton },
  ];

  return (
    <>
      <ScholarshipTable items={scholarships} columns={columns} />

      <ScholarshipMobileCards
        items={scholarships}
        renderTopAction={renderFavoriteButton}
        renderActions={(item) => {
          const href = getScholarshipUrl(item);
          return (
            <>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => onOpenDetail(item)}
              >
                <FaInfoCircle className="h-3.5 w-3.5" aria-hidden="true" />
                상세 보기
              </Button>
              {href ? (
                <Button
                  as="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="sm"
                  fullWidth
                >
                  <FaExternalLinkAlt className="h-3 w-3" aria-hidden="true" />
                  홈페이지
                </Button>
              ) : (
                <Button disabled size="sm" fullWidth>
                  없음
                </Button>
              )}
            </>
          );
        }}
      />
    </>
  );
}

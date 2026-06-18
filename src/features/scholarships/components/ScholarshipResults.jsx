import {
  FaExternalLinkAlt,
  FaHeart,
  FaInfoCircle,
  FaRegCalendarAlt,
  FaRegHeart,
} from "react-icons/fa";
import { getScholarshipUrl } from "../../../shared/utils/urls";

export default function ScholarshipResults({
  scholarships,
  favorites,
  isFavoritePending,
  onOpenDetail,
  onToggleFavorite,
}) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="scholarships-table w-full">
          <thead>
            <tr>
              <th>장학 재단명</th>
              <th>장학 사업명</th>
              <th>기간</th>
              <th>상세/홈페이지</th>
              <th>찜</th>
            </tr>
          </thead>
          <tbody>
            {scholarships.map((item) => {
              const href = getScholarshipUrl(item);
              return (
                <tr key={item.product_id}>
                  <td>{item.foundation_name}</td>
                  <td>{item.name}</td>
                  <td>{item.recruitment_start} ~ {item.recruitment_end}</td>
                  <td>
                    <div className="scholarship-actions">
                      <button onClick={() => onOpenDetail(item)} className="details-btn">
                        상세정보 보기
                      </button>
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="details-btn">
                          홈페이지 보기
                        </a>
                      ) : (
                        <span className="text-gray-400">홈페이지 없음</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => onToggleFavorite(item)}
                      className="favorite-btn"
                      disabled={isFavoritePending}
                      title={favorites.has(item.product_id) ? "관심 해제" : "관심 등록"}
                    >
                      {favorites.has(item.product_id) ? (
                        <FaHeart className="h-5 w-5 text-rose-500" aria-hidden="true" />
                      ) : (
                        <FaRegHeart className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="scholarship-mobile-list md:hidden">
        {scholarships.map((item) => {
          const href = getScholarshipUrl(item);
          const isFavorited = favorites.has(item.product_id);
          return (
            <article key={item.product_id} className="scholarship-mobile-card">
              <button
                onClick={() => onToggleFavorite(item)}
                className="scholarship-card-favorite"
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

              <div className="scholarship-card-body">
                <div className="scholarship-card-foundation">{item.foundation_name}</div>
                <h3 className="scholarship-card-title">{item.name}</h3>
                <div className="scholarship-card-period">
                  <FaRegCalendarAlt className="scholarship-card-period-icon" aria-hidden="true" />
                  {item.recruitment_start} ~ {item.recruitment_end}
                </div>
              </div>

              <div className="scholarship-card-actions">
                <div className="scholarship-card-action-group">
                  <button onClick={() => onOpenDetail(item)} className="scholarship-mobile-action">
                    <FaInfoCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    상세
                  </button>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="scholarship-mobile-action"
                    >
                      <FaExternalLinkAlt className="h-3 w-3" aria-hidden="true" />
                      홈페이지
                    </a>
                  ) : (
                    <span className="text-gray-400">없음</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

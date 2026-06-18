import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import { getPageList } from "../utils/pagination";

export default function ScholarshipPagination({
  page,
  perPage,
  totalCount,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
  onPerPageChange,
}) {
  return (
    <div className="pagination">
      <span className="range-text">{startIndex}-{endIndex} / 총 {totalCount}건</span>

      <button className="icon-btn" onClick={() => onPageChange(1)} disabled={page === 1} title="처음">
        <FaAngleDoubleLeft aria-hidden="true" />
      </button>
      <button
        className="icon-btn"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        title="이전"
      >
        <FaAngleLeft aria-hidden="true" />
      </button>

      {getPageList(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`ellipsis-${index}`} className="ellipsis">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`page-btn ${item === page ? "is-current" : ""}`}
            aria-current={item === page ? "page" : undefined}
            title={`${item}페이지`}
          >
            {item}
          </button>
        )
      )}

      <button
        className="icon-btn"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        title="다음"
      >
        <FaAngleRight aria-hidden="true" />
      </button>
      <button
        className="icon-btn"
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        title="맨끝"
      >
        <FaAngleDoubleRight aria-hidden="true" />
      </button>

      <select
        className="perpage-select"
        value={perPage}
        onChange={(event) => onPerPageChange(Number(event.target.value))}
        aria-label="페이지당 항목 수"
      >
        <option value={10}>10개씩</option>
        <option value={20}>20개씩</option>
        <option value={50}>50개씩</option>
      </select>
    </div>
  );
}

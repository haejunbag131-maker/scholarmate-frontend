import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import { getPageList } from "../utils/pagination";

const paginationClassName = "mt-5 flex flex-wrap items-center justify-center gap-2";
const rangeClassName = "mr-1 text-sm text-gray-500";
const pageButtonFrameClassName =
  "inline-flex h-[38px] min-w-[38px] cursor-pointer items-center justify-center rounded-lg border px-2.5 leading-none transition-colors focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-md:text-xs max-[480px]:h-[26px] max-[480px]:min-w-[26px] max-[480px]:px-1.5 max-[480px]:text-[0.65rem]";
const pageButtonNormalClassName =
  "border-gray-300 bg-white text-gray-950 hover:border-gray-900 hover:bg-gray-900 hover:text-white";
const pageButtonCurrentClassName =
  "!border-gray-900 !bg-gray-900 !text-white hover:!border-slate-950 hover:!bg-slate-950 hover:!text-white";
const selectClassName =
  "ml-1 h-[38px] rounded-lg border border-gray-300 bg-white px-2.5 text-gray-950 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2";

const getPageButtonClassName = (isCurrent = false) =>
  [
    pageButtonFrameClassName,
    isCurrent ? pageButtonCurrentClassName : pageButtonNormalClassName,
  ].join(" ");

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
    <div className={paginationClassName}>
      <span className={rangeClassName}>{startIndex}-{endIndex} / 총 {totalCount}건</span>

      <button className={getPageButtonClassName()} onClick={() => onPageChange(1)} disabled={page === 1} title="처음">
        <FaAngleDoubleLeft aria-hidden="true" />
      </button>
      <button
        className={getPageButtonClassName()}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        title="이전"
      >
        <FaAngleLeft aria-hidden="true" />
      </button>

      {getPageList(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`ellipsis-${index}`} className="select-none px-1 text-gray-500">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={getPageButtonClassName(item === page)}
            aria-current={item === page ? "page" : undefined}
            title={`${item}페이지`}
          >
            {item}
          </button>
        )
      )}

      <button
        className={getPageButtonClassName()}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        title="다음"
      >
        <FaAngleRight aria-hidden="true" />
      </button>
      <button
        className={getPageButtonClassName()}
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        title="맨끝"
      >
        <FaAngleDoubleRight aria-hidden="true" />
      </button>

      <select
        className={selectClassName}
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

import SearchBox from "../../../shared/components/SearchBox";
import UserInfoSelect from "../../userInfo/components/UserInfoSelect";

const filterShellClassName =
  "mb-5 flex flex-wrap items-center gap-2.5 max-md:flex-row max-md:items-stretch max-md:rounded-[18px] max-md:border max-md:border-gray-200 max-md:bg-slate-50 max-md:p-3.5 max-md:shadow-[0_8px_22px_rgba(15,23,42,0.05)]";
const searchRowClassName =
  "flex min-w-[280px] flex-[1_1_520px] items-stretch gap-2.5 max-md:w-full max-md:min-w-0 max-md:flex-[1_1_100%] max-md:gap-2";
const selectRowClassName =
  "mr-2 flex min-w-[320px] flex-none items-stretch gap-2.5 max-md:mr-0 max-md:grid max-md:w-full max-md:min-w-0 max-md:flex-[1_1_100%] max-md:grid-cols-2 max-md:gap-2";

const typeOptions = [
  { value: "regional", label: "지역 연고" },
  { value: "academic", label: "성적 우수" },
  { value: "income_based", label: "소득 구분" },
  { value: "special_talent", label: "특기자" },
  { value: "other", label: "기타" },
];

const sortOptions = [{ value: "end_date", label: "모집 종료일 순" }];

export default function ScholarshipFilters({
  searchInput,
  selectedType,
  sortOrder,
  onSearchInputChange,
  onSearch,
  onTypeChange,
  onSortChange,
}) {
  return (
    <div className={filterShellClassName} role="search" aria-label="장학금 검색 및 필터">
      <div className={searchRowClassName}>
        <SearchBox
          value={searchInput}
          onChange={onSearchInputChange}
          onSearch={onSearch}
          placeholder="장학 사업명 검색"
          ariaLabel="장학금 검색"
        />
      </div>

      <div className={selectRowClassName}>
        <UserInfoSelect
          value={selectedType}
          onChange={(value) => onTypeChange({ target: { value } })}
          options={typeOptions}
          placeholder="모든 유형"
        />

        <UserInfoSelect
          value={sortOrder}
          onChange={(value) => onSortChange({ target: { value } })}
          options={sortOptions}
          placeholder="정렬 없음"
        />
      </div>
    </div>
  );
}

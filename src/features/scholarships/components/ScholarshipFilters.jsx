import SearchBox from "../../../shared/components/SearchBox";

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
    <div className="search-and-filter" role="search" aria-label="장학금 검색 및 필터">
      <div className="scholarship-search-row">
        <SearchBox
          value={searchInput}
          onChange={onSearchInputChange}
          onSearch={onSearch}
          placeholder="장학 사업명 검색"
          ariaLabel="장학금 검색"
        />
      </div>

      <div className="scholarship-select-row">
        <select value={selectedType} onChange={onTypeChange} className="filter-dropdown">
          <option value="">모든 유형</option>
          <option value="regional">지역 연고</option>
          <option value="academic">성적 우수</option>
          <option value="income_based">소득 구분</option>
          <option value="special_talent">특기자</option>
          <option value="other">기타</option>
        </select>

        <select value={sortOrder} onChange={onSortChange} className="sort-dropdown">
          <option value="">정렬 없음</option>
          <option value="end_date">모집 종료일 순</option>
        </select>
      </div>
    </div>
  );
}

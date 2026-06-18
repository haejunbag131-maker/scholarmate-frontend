export default function ScholarshipFilters({
  searchInput,
  selectedType,
  sortOrder,
  onSearchInputChange,
  onSearch,
  onClearSearch,
  onTypeChange,
  onSortChange,
}) {
  return (
    <div className="search-and-filter" role="search" aria-label="장학금 검색 및 필터">
      <div className="scholarship-search-row">
        <input
          type="text"
          placeholder="장학 사업명 검색"
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearch();
          }}
          className="search-input"
        />
        <button onClick={onSearch} className="search-btn text-white">
          검색
        </button>
      </div>
      <button
        onClick={onClearSearch}
        className="search-clear-btn bg-white text-black border border-gray-300 rounded px-3"
      >
        검색어 지우기
      </button>

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

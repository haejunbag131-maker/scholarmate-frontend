import SearchBox from "../../../shared/components/SearchBox";

function SegmentedButtons({ label, value, options, onChange }) {
  return (
    <div className="community-segment" aria-label={label}>
      <span className="community-segment__label">{label}</span>
      <div className="community-segment__buttons">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "community-segment__button",
              value === option.value ? "community-segment__button--active" : "",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CommunityToolbar({
  order,
  viewMode,
  category,
  searchInput,
  isLoggedIn,
  onOrderChange,
  onViewModeChange,
  onCategoryChange,
  onSearchInputChange,
  onSearch,
  onClearSearch,
  onOpenCompose,
}) {
  return (
    <section className="community-toolbar">
      <div className="community-toolbar__inner">
        <div className="community-toolbar__heading">
          <p>장학 정보 공유 공간</p>
          <h1>ScholarMate 커뮤니티</h1>
        </div>

        <div className="community-filter-card">
          <div className="community-filter-row">
            <SegmentedButtons
              label="정렬"
              value={order}
              onChange={onOrderChange}
              options={[
                { label: "최신", value: "latest" },
                { label: "인기", value: "popular" },
              ]}
            />

            <SegmentedButtons
              label="보기"
              value={viewMode}
              onChange={onViewModeChange}
              options={[
                { label: "전체", value: "all" },
                { label: "내 북마크", value: "bookmarks" },
              ]}
            />
          </div>

          <div className="community-filter-row community-filter-row--bottom">
            <SegmentedButtons
              label="분류"
              value={category}
              onChange={onCategoryChange}
              options={[
                { label: "스토리", value: "story" },
                { label: "피드", value: "feed" },
              ]}
            />

            <div className="community-search-actions">
              <SearchBox
                value={searchInput}
                onChange={onSearchInputChange}
                onSearch={onSearch}
                onClear={onClearSearch}
                placeholder="검색..."
                ariaLabel="커뮤니티 검색"
              />

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={onOpenCompose}
                  className="community-compose-button"
                >
                  글쓰기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

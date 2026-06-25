import SearchBox from "../../../shared/components/SearchBox";

const segmentWrapperClassName =
  "flex min-w-0 items-center gap-2 max-md:w-full max-md:flex-col max-md:items-start max-md:gap-1.5";
const segmentLabelClassName = "whitespace-nowrap text-xs font-extrabold text-white/80";
const segmentButtonsClassName =
  "inline-flex gap-1.5 rounded-full bg-white/15 p-1 max-md:w-full max-md:overflow-x-auto";
const segmentButtonBaseClassName =
  "min-h-9 whitespace-nowrap rounded-full border-0 bg-transparent px-3.5 py-1.5 text-sm font-extrabold text-white transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60";
const segmentButtonActiveClassName =
  "!bg-[var(--color-primary)] !text-white shadow-[0_4px_12px_rgba(15,23,42,0.18)] ring-1 ring-white/50 hover:!bg-[var(--color-primary)] hover:!text-white";

function SegmentedButtons({ label, value, options, onChange }) {
  return (
    <div className={segmentWrapperClassName} aria-label={label}>
      <span className={segmentLabelClassName}>{label}</span>
      <div className={segmentButtonsClassName}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              segmentButtonBaseClassName,
              value === option.value ? segmentButtonActiveClassName : "",
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
    <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] px-[var(--page-padding-x)] pb-8 pt-[var(--page-padding-top)] shadow-[0_12px_32px_rgba(37,99,235,0.18)] max-lg:pb-[30px] max-md:px-4 max-md:pb-7 max-md:pt-4 max-[480px]:px-3.5">
      <div className="mx-auto w-full max-w-[var(--page-max-width)] p-0 text-white max-lg:max-w-[760px]">
        <div className="mb-5">
          <p className="mb-1.5 text-sm font-bold text-white/80">장학 정보 공유 공간</p>
          <h1 className="m-0 text-[var(--page-title-size)] font-black leading-[var(--page-title-line-height)] tracking-normal max-md:text-[1.25rem] max-[360px]:text-[1.15rem]">
            ScholarMate 커뮤니티
          </h1>
        </div>

        <div className="flex flex-col gap-3.5 rounded-[20px] border border-white/20 bg-white/10 p-4 backdrop-blur-md max-md:p-3">
          <div className="flex flex-wrap items-center justify-between gap-3 max-md:items-stretch">
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

          <div className="flex flex-wrap items-stretch justify-between gap-3">
            <SegmentedButtons
              label="분류"
              value={category}
              onChange={onCategoryChange}
              options={[
                { label: "스토리", value: "story" },
                { label: "피드", value: "feed" },
              ]}
            />

            <div className="flex min-w-[280px] flex-[1_1_460px] items-stretch gap-2.5 max-md:w-full max-md:min-w-0 max-md:flex-col">
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
                  className="min-h-[46px] whitespace-nowrap rounded-[14px] border-0 bg-gray-900 px-[18px] text-sm font-black text-white transition-colors hover:bg-slate-950 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 max-md:w-full"
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

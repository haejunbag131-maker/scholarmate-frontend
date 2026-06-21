import PageTitle from "../../../shared/components/PageTitle";
import SearchBox from "../../../shared/components/SearchBox";

export default function CalendarHeader({ searchTerm, onSearchTermChange }) {
  return (
    <div className="mb-6 flex flex-col items-center gap-4">
      <PageTitle className="w-full">나의 장학 캘린더</PageTitle>
      <div className="w-full max-w-3xl">
        <SearchBox
          value={searchTerm}
          onChange={onSearchTermChange}
          onSearch={onSearchTermChange}
          placeholder="장학금 이름 검색"
          ariaLabel="장학 캘린더 검색"
        />
      </div>
    </div>
  );
}

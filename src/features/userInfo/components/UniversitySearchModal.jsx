import SearchBox from "../../../shared/components/SearchBox";

export default function UniversitySearchModal({
  searchQuery,
  universities,
  onSearchChange,
  onSelectUniversity,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-[400px] rounded-[10px] bg-white p-5 text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)] max-md:w-[90%] max-md:p-4 max-[480px]:p-3.5">
        <h3 className="mb-4 text-xl font-bold text-gray-950 max-[480px]:text-lg">대학교 검색</h3>
        <button
          type="button"
          className="absolute right-[15px] top-2.5 rounded-md border-0 bg-gray-900 px-2.5 py-1 text-sm font-bold text-white transition-colors hover:bg-slate-950 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          onClick={onClose}
        >
          닫기
        </button>

        <SearchBox
          value={searchQuery}
          onChange={onSearchChange}
          onSearch={onSearchChange}
          placeholder="대학교 검색"
          ariaLabel="대학교 검색"
        />
        <ul className="mt-2.5 max-h-[200px] list-none overflow-y-auto rounded-md border border-gray-300 p-0 text-left">
          {universities.length > 0 ? (
            universities.map((university) => (
              <li key={university}>
                <button
                  type="button"
                  className="block w-full rounded-none border-0 bg-white px-2.5 py-2.5 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:outline-none"
                  onClick={() => onSelectUniversity(university)}
                >
                  {university}
                </button>
              </li>
            ))
          ) : (
            <li className="px-2.5 py-2.5 text-sm text-gray-500">검색 결과 없음</li>
          )}
        </ul>
      </div>
    </div>
  );
}

import { FaRegCalendarAlt } from "react-icons/fa";

export default function CalendarHeader({ searchTerm, onSearchTermChange }) {
  return (
    <div className="mb-6 flex flex-col items-center gap-4">
      <h1 className="mb-2 border-b border-gray-300 pb-3 text-center text-2xl font-bold text-gray-900 sm:pb-4 sm:text-3xl">
        <span className="inline-flex items-center justify-center gap-2">
          <FaRegCalendarAlt className="h-6 w-6 text-blue-700 sm:h-7 sm:w-7" aria-hidden="true" />
          나의 장학 캘린더
        </span>
      </h1>
      <input
        type="text"
        placeholder="장학금 이름 검색"
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        className="w-full max-w-3xl rounded-md border-2 border-blue-600 bg-white px-3 py-2 text-base text-gray-900 outline-none transition focus:border-blue-800"
      />
    </div>
  );
}

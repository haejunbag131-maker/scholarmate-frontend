export default function UniversitySearchModal({
  searchQuery,
  universities,
  onSearchChange,
  onSelectUniversity,
  onClose,
}) {
  return (
    <div className="user-info-modal-overlay">
      <div className="user-info-modal">
        <h3>대학교 검색</h3>
        <button className="user-info-close-btn" onClick={onClose}>
          닫기
        </button>

        <input
          type="text"
          className="search-input"
          placeholder="대학교 검색"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <ul className="user-info-dropdown-list">
          {universities.length > 0 ? (
            universities.map((university) => (
              <li key={university} onClick={() => onSelectUniversity(university)}>
                {university}
              </li>
            ))
          ) : (
            <li>검색 결과 없음</li>
          )}
        </ul>
      </div>
    </div>
  );
}

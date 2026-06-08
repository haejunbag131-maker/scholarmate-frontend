import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import ScholarshipDetailModal from "../features/scholarships/components/ScholarshipDetailModal";
import ScholarshipToast from "../features/scholarships/components/ScholarshipToast";
import useBodyClass from "../shared/hooks/useBodyClass";
import useToast from "../shared/hooks/useToast";
import { getScholarshipUrl } from "../shared/utils/urls";
import "../assets/css/scholarships.css";

const TYPE_KR = {
  regional: "지역연고",
  academic: "성적우수",
  income_based: "소득구분",
  special_talent: "특기자",
  other: "기타",
};

const parseListResponse = (data) => {
  if (Array.isArray(data)) return { items: data, count: data.length };
  if (data && Array.isArray(data.results))
    return { items: data.results, count: data.count ?? data.results.length };
  if (data && Array.isArray(data.data)) {
    const count = data.total ?? data.count ?? data.data.length;
    return { items: data.data, count };
  }
  return { items: [], count: 0 };
};

export default function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // UI 코드값
  const [selectedType, setSelectedType] = useState("");   // regional | academic | income_based | special_talent | other
  const [sortOrder, setSortOrder] = useState("");         // '' | 'end_date'
  const [favorites, setFavorites] = useState(new Set());

  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast, showToast } = useToast();

  // ====== (2) API 호출 ======
  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 프론트 코드값을 백엔드가 쓰는 한글(product_type)로 변환
      const typeParam = selectedType ? (TYPE_KR[selectedType] ?? selectedType) : undefined;

      const params = {
        page,
        perPage: Number.isFinite(perPage) ? perPage : 10,     // ✅ 백엔드 규약
        search: (searchQuery || "").trim() || undefined,
        type: typeParam,                                      // ✅ '지역연고' 등
        sort: (sortOrder || "").trim() || undefined,          // ✅ 'end_date'
      };

      const { data } = await api.get("/scholarships/", { params });

      const { items, count } = parseListResponse(data);
      const dataWithIds = items.map((item) => ({ ...item, id: item.product_id }));

      setScholarships(dataWithIds);
      setTotalCount(Number.isFinite(count) ? count : dataWithIds.length);
    } catch {
      setError("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchQuery, selectedType, sortOrder]);

  const fetchFavorites = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data } = await api.get("/scholarships/wishlist/", {
        headers: { Authorization: `JWT ${token}` },
      });
      const ids = (data || []).map((item) => item.scholarship.product_id);
      setFavorites(new Set(ids));
    } catch { /* 무시 */ }
  }, []);

  useBodyClass("scholarships-page");
  useEffect(() => { fetchScholarships(); }, [fetchScholarships]);
  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  // ====== UI 핸들러 ======
  const openModal = (scholarship) => { setSelectedScholarship(scholarship); setIsModalOpen(true); };
  const closeModal = () => { setSelectedScholarship(null); setIsModalOpen(false); };
  const handleTypeChange = (e) => { setSelectedType(e.target.value); setPage(1); };
  const handleSortChange = (e) => { setSortOrder(e.target.value); setPage(1); };
  const doSearch = () => { setSearchQuery(searchInput.trim()); setPage(1); };
  const clearSearch = () => { setSearchInput(""); setSearchQuery(""); setPage(1); };

  const handleFavoriteToggle = async (item) => {
    const id = item.product_id;
    const isFavorited = favorites.has(id);
    const token = localStorage.getItem("token");
    if (!token) { showToast("로그인이 필요합니다.", "error", 2200); return; }

    const url = isFavorited ? "/scholarships/wishlist/toggle/" : "/scholarships/wishlist/add-from-api/";
    try {
      const { status } = await api.post(
        url,
        isFavorited ? { product_id: id, action: "remove" } : item,
        { headers: { Authorization: `JWT ${token}` } }
      );
      if (status !== 200 && status !== 201) throw new Error("서버 오류");

      setFavorites((prev) => {
        const updated = new Set(prev);
        if (isFavorited) { updated.delete(id); showToast("관심 장학금에서 해제되었습니다.", "info"); }
        else { updated.add(id); showToast("관심 장학금에 추가되었습니다.", "success"); }
        return updated;
      });
    } catch (err) {
      showToast(err.message || "찜 처리 중 오류 발생", "error", 2500);
    }
  };

  // ====== 페이지네이션 계산 ======
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / perPage));
  const startIdx = totalCount === 0 ? 0 : (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, totalCount || 0);

  const getPageList = (cur, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    const push = (p) => { if (pages[pages.length - 1] !== p) pages.push(p); };
    const ellipsis = () => { if (pages[pages.length - 1] !== "…") pages.push("…"); };
    push(1); push(2);
    const start = Math.max(3, cur - 1);
    const end   = Math.min(total - 2, cur + 1);
    if (start > 3) ellipsis();
    for (let p = start; p <= end; p++) push(p);
    if (end < total - 2) ellipsis();
    push(total - 1); push(total);
    return pages;
  };

  return (
    <div className="scholarships-container">
      <div className="scholarships-wrapper">
        <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-300 text-gray-900">장학금 목록</h1>

        <div className="search-and-filter">
          <input
            type="text"
            placeholder="장학 사업명 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }}
            className="search-input"
          />
          <button onClick={doSearch} className="search-btn text-white">검색</button>
          <button onClick={clearSearch} className="search-clear-btn bg-white text-black border border-gray-300 rounded px-3">검색어 지우기</button>

          <select value={selectedType} onChange={handleTypeChange} className="filter-dropdown">
            <option value="">모든 유형</option>
            <option value="regional">지역 연고</option>
            <option value="academic">성적 우수</option>
            <option value="income_based">소득 구분</option>
            <option value="special_talent">특기자</option>
            <option value="other">기타</option>
          </select>

          <select value={sortOrder} onChange={handleSortChange} className="sort-dropdown">
            <option value="">정렬 없음</option>
            <option value="end_date">모집 종료일 순</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : scholarships.length === 0 ? (
          <div className="no-results">검색 결과가 없습니다.</div>
        ) : (
          <>
            {/* 데스크톱 테이블 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="scholarships-table w-full">
                <thead>
                  <tr>
                    <th>장학 재단명</th>
                    <th>장학 사업명</th>
                    <th>기간</th>
                    <th>상세정보</th>
                    <th>홈페이지</th>
                    <th>찜</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarships.map((item) => {
                    const href = getScholarshipUrl(item);
                    return (
                      <tr key={item.product_id}>
                        <td>{item.foundation_name}</td>
                        <td>{item.name}</td>
                        <td>{item.recruitment_start} ~ {item.recruitment_end}</td>
                        <td><button onClick={() => openModal(item)} className="details-btn">상세정보 보기</button></td>
                        <td>
                          {href ? (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="details-btn">홈페이지 보기</a>
                          ) : (
                            <span className="text-gray-400">홈페이지 없음</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleFavoriteToggle(item)}
                            className="favorite-btn"
                            title={favorites.has(item.product_id) ? "관심 해제" : "관심 등록"}
                          >
                            {favorites.has(item.product_id) ? "❤️" : "🤍"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="md:hidden space-y-4">
              {scholarships.map((item) => {
                const href = getScholarshipUrl(item);
                return (
                  <div key={item.product_id} className="bg-white border rounded-lg shadow-sm p-4">
                    <div className="text-xs text-gray-500 mb-1">{item.foundation_name}</div>
                    <div className="text-sm font-semibold text-blue-700 mb-1">{item.name}</div>
                    <div className="text-xs text-gray-600 mb-2">{item.recruitment_start} ~ {item.recruitment_end}</div>
                    <div className="flex items-center justify-between text-xs">
                      <button onClick={() => openModal(item)} className="px-2 py-1 bg-blue-600 text-white rounded">상세</button>
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">홈페이지</a>
                      ) : (
                        <span className="text-gray-400">없음</span>
                      )}
                      <button onClick={() => handleFavoriteToggle(item)} className="ml-2 text-lg">
                        {favorites.has(item.product_id) ? "❤️" : "🤍"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 페이지네이션 */}
            <div className="pagination">
              <span className="range-text">{startIdx}-{endIdx} / 총 {totalCount}건</span>

              <button className="icon-btn" onClick={() => setPage(1)} disabled={page === 1} title="처음">⏮</button>
              <button className="icon-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} title="이전">‹</button>

              {getPageList(page, totalPages).map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`page-btn ${p === page ? "is-current" : ""}`}
                    aria-current={p === page ? "page" : undefined}
                    title={`${p}페이지`}
                  >
                    {p}
                  </button>
                )
              )}

              <button className="icon-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="다음">›</button>
              <button className="icon-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages} title="맨끝">⏭</button>

              <select
                className="perpage-select"
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                aria-label="페이지당 항목 수"
              >
                <option value={10}>10개씩</option>
                <option value={20}>20개씩</option>
                <option value={50}>50개씩</option>
              </select>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <ScholarshipDetailModal scholarship={selectedScholarship} onClose={closeModal} />
      )}
      <ScholarshipToast toast={toast} />
    </div>
  );
}

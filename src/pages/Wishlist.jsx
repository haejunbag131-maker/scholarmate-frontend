import { useEffect, useState } from "react";
import api from "../api/axios";  
import ScholarshipDetailModal from "../features/scholarships/components/ScholarshipDetailModal";
import useBodyClass from "../shared/hooks/useBodyClass";
import { getScholarshipUrl } from "../shared/utils/urls";

import "../assets/css/scholarships.css";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useBodyClass("wishlist-page");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await api.get("/scholarships/wishlist/");
        setWishlist(data);
      } catch (e) {
        setError(e?.message || "요청 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleDelete = async (scholarshipId) => {
    if (!window.confirm("정말로 관심 장학금에서 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/scholarships/wishlist/delete/${scholarshipId}/`);
      setWishlist((prev) =>
        prev.filter((item) => item.scholarship.id !== scholarshipId)
      );
    } catch (e) {
      alert(e?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  const openModal = (scholarship) => {
    setSelectedScholarship(scholarship);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedScholarship(null);
    setIsModalOpen(false);
  };

  return (
    <div className="wishlist-wrapper mt-14">
      <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-300 text-gray-900">
        관심 장학금 목록
      </h1>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : wishlist.length === 0 ? (
        <div className="no-results">관심 장학금이 없습니다.</div>
      ) : (
        <>
          {/* 데스크탑/태블릿: 테이블 */}
          <div className="hidden md:block wishlist-table-container">
            <table className="wishlist-table">
              <thead>
                <tr>
                  <th>장학 재단명</th>
                  <th>장학 사업명</th>
                  <th>모집 기간</th>
                  <th>홈페이지</th>
                  <th>상세/삭제</th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map((item) => {
                  const s = item.scholarship;
                  const href = getScholarshipUrl(s);
                  return (
                    <tr key={s.id}>
                      <td>{s.foundation_name}</td>
                      <td>{s.name}</td>
                      <td>
                        {s.recruitment_start} ~ {s.recruitment_end}
                      </td>
                      <td>
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="details-btn inline-flex items-center justify-center"
                            title="홈페이지 열기"
                          >
                            홈페이지 보기
                          </a>
                        ) : (
                          <span className="text-gray-400">홈페이지 없음</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => openModal(s)}
                          className="details-btn"
                        >
                          상세보기
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="delete-btn"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 모바일: 카드형 */}
          <div className="md:hidden space-y-4">
            {wishlist.map((item) => {
              const s = item.scholarship;
              const href = getScholarshipUrl(s);
              return (
                <div
                  key={s.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {s.foundation_name}
                  </div>
                  <div className="text-sm font-semibold text-blue-700 mb-1">
                    {s.name}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {s.recruitment_start} ~ {s.recruitment_end}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        홈페이지
                      </a>
                    ) : (
                      <span className="text-gray-400">없음</span>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(s)}
                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-xs"
                      >
                        상세
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {isModalOpen && (
        <ScholarshipDetailModal scholarship={selectedScholarship} onClose={closeModal} />
      )}
    </div>
  );
}

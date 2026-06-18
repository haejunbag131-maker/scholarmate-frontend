import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteWishlistItem, fetchWishlistItems } from "../api/scholarships";
import { message, Modal } from "antd";
import {
  FaExternalLinkAlt,
  FaInfoCircle,
  FaRegCalendarAlt,
  FaTrashAlt,
} from "react-icons/fa";
import ScholarshipDetailModal from "../features/scholarships/components/ScholarshipDetailModal";
import useBodyClass from "../shared/hooks/useBodyClass";
import { queryKeys } from "../shared/queryKeys";
import { getScholarshipUrl } from "../shared/utils/urls";

import "../assets/css/scholarships.css";

export default function Wishlist() {
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  useBodyClass("wishlist-page");

  const wishlistQuery = useQuery({
    queryKey: queryKeys.scholarships.wishlist,
    queryFn: fetchWishlistItems,
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWishlistItem,
    onMutate: async (scholarshipId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.scholarships.wishlist,
      });
      const previousWishlist = queryClient.getQueryData(
        queryKeys.scholarships.wishlist
      );
      queryClient.setQueryData(queryKeys.scholarships.wishlist, (current) =>
        (current ?? []).filter((item) => item.scholarship.id !== scholarshipId)
      );
      return { previousWishlist };
    },
    onSuccess: () => {
      message.success("관심 장학금에서 삭제되었습니다.");
    },
    onError: (e, _scholarshipId, context) => {
      if (context && "previousWishlist" in context) {
        queryClient.setQueryData(
          queryKeys.scholarships.wishlist,
          context.previousWishlist
        );
      }
      message.error(e?.message || "삭제 중 오류가 발생했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scholarships.wishlist,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.scholarships.favorites,
      });
    },
  });

  const wishlist = wishlistQuery.data ?? [];
  const loading = wishlistQuery.isPending;
  const error = wishlistQuery.isError
    ? wishlistQuery.error?.message || "요청 중 오류가 발생했습니다."
    : null;

  const handleDelete = (scholarshipId) => {
    Modal.confirm({
      title: "관심 장학금에서 삭제하시겠습니까?",
      okText: "삭제",
      cancelText: "취소",
      okButtonProps: {
        danger: true,
      },
      async onOk() {
        await deleteMutation.mutateAsync(scholarshipId);
      },
    });
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
    <div className="wishlist-wrapper">
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
          <div className="hidden lg:block wishlist-table-container">
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
                          disabled={deleteMutation.isPending}
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
          <div className="scholarship-mobile-list wishlist-mobile-list lg:hidden">
            {wishlist.map((item) => {
              const s = item.scholarship;
              const href = getScholarshipUrl(s);
              return (
                <article
                  key={s.id}
                  className="scholarship-mobile-card wishlist-mobile-card"
                >
                  <div className="scholarship-card-body wishlist-card-body">
                    <div className="scholarship-card-foundation">
                      {s.foundation_name}
                    </div>
                    <h3 className="scholarship-card-title">{s.name}</h3>
                    <div className="scholarship-card-period">
                      <FaRegCalendarAlt className="scholarship-card-period-icon" aria-hidden="true" />
                      {s.recruitment_start} ~ {s.recruitment_end}
                    </div>
                  </div>

                  <div className="scholarship-card-actions">
                    <div className="wishlist-card-action-grid">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="scholarship-mobile-action"
                        >
                          <FaExternalLinkAlt className="h-3 w-3" aria-hidden="true" />
                          홈페이지
                        </a>
                      ) : (
                        <span className="scholarship-mobile-action scholarship-mobile-action--disabled">
                          홈페이지 없음
                        </span>
                      )}
                      <button
                        onClick={() => openModal(s)}
                        className="scholarship-mobile-action"
                      >
                        <FaInfoCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        상세
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deleteMutation.isPending}
                        className="scholarship-danger-action"
                      >
                        <FaTrashAlt className="h-3 w-3" aria-hidden="true" />
                        삭제
                      </button>
                    </div>
                  </div>
                </article>
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

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchScholarships,
  fetchScholarshipWishlist,
  toggleScholarshipWishlist,
} from "../api/scholarships";
import ScholarshipDetailModal from "../features/scholarships/components/ScholarshipDetailModal";
import ScholarshipFilters from "../features/scholarships/components/ScholarshipFilters";
import ScholarshipPagination from "../features/scholarships/components/ScholarshipPagination";
import ScholarshipResults from "../features/scholarships/components/ScholarshipResults";
import ScholarshipToast from "../features/scholarships/components/ScholarshipToast";
import useBodyClass from "../shared/hooks/useBodyClass";
import useToast from "../shared/hooks/useToast";
import { queryKeys } from "../shared/queryKeys";
import "../assets/css/scholarships.css";

const EMPTY_FAVORITES = new Set();

export default function Scholarships() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedType, setSelectedType] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast, showToast } = useToast();
  const scholarshipParams = {
    page,
    perPage,
    searchQuery,
    selectedType,
    sortOrder,
  };
  const hasToken = Boolean(localStorage.getItem("token"));

  const scholarshipsQuery = useQuery({
    queryKey: queryKeys.scholarships.list(scholarshipParams),
    queryFn: () => fetchScholarships(scholarshipParams),
    placeholderData: (previousData) => previousData,
  });

  useBodyClass("scholarships-page");

  const favoritesQuery = useQuery({
    queryKey: queryKeys.scholarships.favorites,
    queryFn: fetchScholarshipWishlist,
    enabled: hasToken,
    staleTime: 5 * 60_000,
  });

  const favoriteMutation = useMutation({
    mutationFn: toggleScholarshipWishlist,
    onMutate: async ({ item, isFavorited }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.scholarships.favorites,
      });

      const previousFavorites = queryClient.getQueryData(
        queryKeys.scholarships.favorites
      );

      queryClient.setQueryData(queryKeys.scholarships.favorites, (current) => {
        const next = new Set(current ?? []);
        if (isFavorited) next.delete(item.product_id);
        else next.add(item.product_id);
        return next;
      });

      return { previousFavorites };
    },
    onSuccess: (_, { isFavorited }) => {
      showToast(
        isFavorited
          ? "관심 장학금에서 해제되었습니다."
          : "관심 장학금에 추가되었습니다.",
        isFavorited ? "info" : "success"
      );
    },
    onError: (err, _variables, context) => {
      if (context && "previousFavorites" in context) {
        queryClient.setQueryData(
          queryKeys.scholarships.favorites,
          context.previousFavorites
        );
      }
      showToast(err.message || "찜 처리 중 오류 발생", "error", 2500);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scholarships.favorites,
      });
    },
  });

  const scholarships = scholarshipsQuery.data?.items ?? [];
  const totalCount = scholarshipsQuery.data?.totalCount ?? 0;
  const loading = scholarshipsQuery.isPending && !scholarshipsQuery.data;
  const error = scholarshipsQuery.isError
    ? "데이터를 불러오는 데 실패했습니다."
    : null;
  const favorites = favoritesQuery.data ?? EMPTY_FAVORITES;

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
    favoriteMutation.mutate({ item, isFavorited });
  };

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / perPage));
  const startIdx = totalCount === 0 ? 0 : (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, totalCount || 0);

  return (
    <div className="scholarships-container">
      <div className="scholarships-wrapper">
        <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-300 text-gray-900">장학금 목록</h1>

        <ScholarshipFilters
          searchInput={searchInput}
          selectedType={selectedType}
          sortOrder={sortOrder}
          onSearchInputChange={setSearchInput}
          onSearch={doSearch}
          onClearSearch={clearSearch}
          onTypeChange={handleTypeChange}
          onSortChange={handleSortChange}
        />

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : scholarships.length === 0 ? (
          <div className="no-results">검색 결과가 없습니다.</div>
        ) : (
          <>
            <ScholarshipResults
              scholarships={scholarships}
              favorites={favorites}
              isFavoritePending={favoriteMutation.isPending}
              onOpenDetail={openModal}
              onToggleFavorite={handleFavoriteToggle}
            />

            <ScholarshipPagination
              page={page}
              perPage={perPage}
              totalCount={totalCount}
              totalPages={totalPages}
              startIndex={startIdx}
              endIndex={endIdx}
              onPageChange={setPage}
              onPerPageChange={(nextPerPage) => {
                setPerPage(nextPerPage);
                setPage(1);
              }}
            />
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

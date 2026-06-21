import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import {
  fetchRecommendations,
  fetchScholarshipWishlist,
  toggleScholarshipWishlist,
} from "../api/scholarships";
import RecommendationCard from "../features/recommendations/components/RecommendationCard";
import RecommendationDetailModal from "../features/recommendations/components/RecommendationDetailModal";
import RecommendationReasonModal from "../features/recommendations/components/RecommendationReasonModal";
import RecommendationShell from "../features/recommendations/components/RecommendationShell";
import Button from "../shared/components/Button";
import PageTitle from "../shared/components/PageTitle";
import { SkeletonCardGrid } from "../shared/components/Skeleton";
import useToast from "../shared/hooks/useToast";
import { queryKeys } from "../shared/queryKeys";

const EMPTY_FAVORITES = new Set();

function getRecommendationErrorMessage(error) {
  const status = error?.response?.status;
  const detail =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "";

  if (status === 404 || /profile|user.?info|장학.?정보|not\s*found/i.test(String(detail))) {
    return "먼저 장학 정보를 입력하세요.";
  }
  if (String(error?.message).includes("Network")) {
    return "네트워크 오류: 서버에 연결할 수 없습니다.";
  }
  if (String(error?.message).includes("401") || status === 401) {
    return "로그인 세션이 만료되었습니다. 다시 로그인해주세요.";
  }
  return `오류 발생: ${error?.message || "추천 조회에 실패했습니다."}`;
}

export default function Recommendation() {
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [reasonTarget, setReasonTarget] = useState(null);
  const [userName, setUserName] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast } = useToast();
  const hasToken = Boolean(localStorage.getItem("token"));

  const recommendationsQuery = useQuery({
    queryKey: queryKeys.scholarships.recommendations,
    queryFn: fetchRecommendations,
    enabled: hasToken,
    staleTime: 60_000,
  });

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
        const id = item.product_id ?? item.id;
        if (isFavorited) next.delete(id);
        else next.add(id);
        return next;
      });

      return { previousFavorites };
    },
    onSuccess: (_, { isFavorited }) => {
      showToast(
        isFavorited
          ? "관심 장학금에서 삭제되었습니다."
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
      showToast(err.message || "찜 처리 중 오류가 발생했습니다.", "error", 2500);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scholarships.favorites,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.scholarships.wishlist,
      });
    },
  });

  const recommendations = recommendationsQuery.data ?? [];
  const favorites = favoritesQuery.data ?? EMPTY_FAVORITES;
  const atEnd = visibleCount >= recommendations.length;
  const loading = hasToken && recommendationsQuery.isPending;
  const error = !hasToken
    ? "로그인이 필요합니다. 다시 로그인해주세요."
    : recommendationsQuery.isError
    ? getRecommendationErrorMessage(recommendationsQuery.error)
    : null;

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    if (recommendationsQuery.error?.response?.status !== 401) return;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  }, [navigate, recommendationsQuery.error]);

  const toggleFavorite = (item) => {
    const id = item.product_id ?? item.id;
    const isFavorited = favorites.has(id);
    if (!hasToken) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }
    favoriteMutation.mutate({ item, isFavorited });
  };

  if (loading) {
    return (
      <RecommendationShell toast={toast}>
        <SkeletonCardGrid
          count={3}
          className="space-y-4 sm:space-y-6"
          cardClassName="min-h-[180px]"
        />
      </RecommendationShell>
    );
  }

  if (error) {
    const isProfileMissing = error === "먼저 장학 정보를 입력하세요.";
    return (
      <RecommendationShell toast={toast}>
        {isProfileMissing ? (
          <div className="mx-auto w-full max-w-2xl py-6 text-center">
            <div
              className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: "color-mix(in srgb, var(--color-secondary) 12%, #fff)",
              }}
            >
              <span className="text-lg text-[var(--color-primary)]">ℹ️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">추천을 보기 전에</h2>
            <p className="text-gray-700">
              맞춤 추천을 위해 <strong>나의 장학 정보</strong>를 먼저 입력해 주세요.
            </p>
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => navigate("/userinfor")}
              >
                나의 장학 정보 입력하러 가기
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-lg sm:text-xl font-semibold text-red-600 mb-4 text-center">
              {error}
            </div>
            {error.includes("로그인") && (
              <Button
                onClick={() => navigate("/login")}
              >
                로그인하기
              </Button>
            )}
          </div>
        )}
      </RecommendationShell>
    );
  }

  if (!recommendations.length) {
    return (
      <RecommendationShell toast={toast}>
        <div className="text-lg sm:text-xl font-semibold text-yellow-700 text-center">
          현재 추천할 장학금이 없습니다.
        </div>
      </RecommendationShell>
    );
  }

  return (
    <RecommendationShell toast={toast}>
      <PageTitle accent>
        {userName ? (
          <>
            <strong>{userName}</strong>
            <span>님의 추천 장학금</span>
          </>
        ) : (
          "추천 장학금"
        )}
      </PageTitle>

      <p className="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 font-bold">
        <FaStar className="text-yellow-400 text-base sm:text-lg" />
        <span>ScholarMate의 랭킹 시스템으로 추천 정확도가 높은 순으로 최대 5개씩 보여집니다.</span>
      </p>

      <div className="space-y-4 sm:space-y-6">
        {recommendations.slice(0, visibleCount).map((scholarship) => {
          const id = scholarship.product_id ?? scholarship.id;
          return (
            <RecommendationCard
              key={id}
              scholarship={scholarship}
              isFavorited={favorites.has(id)}
              isFavoritePending={favoriteMutation.isPending}
              onOpenDetail={setSelectedScholarship}
              onOpenReason={setReasonTarget}
              onToggleFavorite={toggleFavorite}
            />
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          disabled={atEnd}
          onClick={() =>
            setVisibleCount((count) => Math.min(count + 5, recommendations.length))
          }
        >
          {atEnd ? "모두 확인했습니다" : "더보기"}
        </Button>
      </div>

      {selectedScholarship && (
        <RecommendationDetailModal
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
        />
      )}

      {reasonTarget && (
        <RecommendationReasonModal
          scholarship={reasonTarget}
          onClose={() => setReasonTarget(null)}
        />
      )}
    </RecommendationShell>
  );
}

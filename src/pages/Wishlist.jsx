import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteWishlistItem, fetchWishlistItems } from "../api/scholarships";
import { message, Modal } from "antd";
import {
  FaExternalLinkAlt,
  FaInfoCircle,
  FaTrashAlt,
} from "react-icons/fa";
import ScholarshipDetailModal from "../features/scholarships/components/ScholarshipDetailModal";
import {
  ScholarshipMobileCards,
  ScholarshipTable,
  scholarshipActionsClassName,
  wishlistCardActionGridClassName,
  wishlistMobileListClassName,
  wishlistTableClassName,
  wishlistTableWrapperClassName,
} from "../features/scholarships/components/ScholarshipListViews";
import Button from "../shared/components/Button";
import PageShell from "../shared/components/PageShell";
import PageTitle from "../shared/components/PageTitle";
import { SkeletonCardGrid, SkeletonTable } from "../shared/components/Skeleton";
import useBodyClass from "../shared/hooks/useBodyClass";
import { queryKeys } from "../shared/queryKeys";
import { getScholarshipUrl } from "../shared/utils/urls";

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

  const getWishlistScholarship = (item) => item.scholarship;
  const getWishlistKey = (_item, scholarship) => scholarship.id;

  const renderHomepageButton = (scholarship, fullWidth = false) => {
    const href = getScholarshipUrl(scholarship);
    return href ? (
      <Button
        as="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant="primary"
        size="sm"
        fullWidth={fullWidth}
        title="홈페이지 열기"
      >
        {fullWidth && <FaExternalLinkAlt className="h-3 w-3" aria-hidden="true" />}
        홈페이지{fullWidth ? "" : " 보기"}
      </Button>
    ) : (
      <Button disabled size="sm" fullWidth={fullWidth}>
        홈페이지 없음
      </Button>
    );
  };

  const renderDetailButton = (scholarship, fullWidth = false) => (
    <Button
      variant="secondary"
      size="sm"
      fullWidth={fullWidth}
      onClick={() => openModal(scholarship)}
    >
      {fullWidth && <FaInfoCircle className="h-3.5 w-3.5" aria-hidden="true" />}
      상세 보기
    </Button>
  );

  const renderDeleteButton = (scholarship, fullWidth = false) => (
    <Button
      variant="danger"
      size="sm"
      fullWidth={fullWidth}
      onClick={() => handleDelete(scholarship.id)}
      disabled={deleteMutation.isPending}
    >
      {fullWidth && <FaTrashAlt className="h-3 w-3" aria-hidden="true" />}
      삭제
    </Button>
  );

  const wishlistColumns = [
    { header: "장학 재단명", render: (scholarship) => scholarship.foundation_name },
    { header: "장학 사업명", render: (scholarship) => scholarship.name },
    {
      header: "모집 기간",
      render: (scholarship) =>
        `${scholarship.recruitment_start} ~ ${scholarship.recruitment_end}`,
    },
    {
      header: "홈페이지",
      render: (scholarship) => renderHomepageButton(scholarship),
    },
    {
      header: "상세/삭제",
      render: (scholarship) => (
        <div className={scholarshipActionsClassName}>
          {renderDetailButton(scholarship)}
          {renderDeleteButton(scholarship)}
        </div>
      ),
    },
  ];

  return (
    <PageShell className="min-h-[550px] text-center max-lg:min-h-[480px] max-[480px]:min-h-[320px]">
      <PageTitle>관심 장학금 목록</PageTitle>

      {loading ? (
        <>
          <SkeletonTable
            rows={5}
            columns={5}
            wrapperClassName={wishlistTableWrapperClassName}
            tableClassName={wishlistTableClassName}
            align="center"
          />
          <SkeletonCardGrid
            count={3}
            className={wishlistMobileListClassName}
            variant="scholarship"
            actionCount={3}
          />
        </>
      ) : error ? (
        <div className="py-12 text-center font-semibold text-red-600">{error}</div>
      ) : wishlist.length === 0 ? (
        <div className="py-12 text-center font-semibold text-gray-500">관심 장학금이 없습니다.</div>
      ) : (
        <>
          <ScholarshipTable
            items={wishlist}
            columns={wishlistColumns}
            getScholarship={getWishlistScholarship}
            getKey={getWishlistKey}
            wrapperClassName={wishlistTableWrapperClassName}
            tableClassName={wishlistTableClassName}
            align="center"
            headerCellClassName="sticky top-0 z-[2]"
          />

          <ScholarshipMobileCards
            items={wishlist}
            getScholarship={getWishlistScholarship}
            getKey={getWishlistKey}
            listClassName={wishlistMobileListClassName}
            cardClassName="text-left"
            bodyClassName="pr-0"
            actionGridClassName={wishlistCardActionGridClassName}
            renderActions={(scholarship) => (
              <>
                {renderHomepageButton(scholarship, true)}
                {renderDetailButton(scholarship, true)}
                {renderDeleteButton(scholarship, true)}
              </>
            )}
          />
        </>
      )}

      {isModalOpen && (
        <ScholarshipDetailModal scholarship={selectedScholarship} onClose={closeModal} />
      )}
    </PageShell>
  );
}

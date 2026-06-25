import { SkeletonCardGrid, SkeletonTable } from "../shared/components/Skeleton";
import {
  scholarshipMobileListClassName,
  scholarshipTableClassName,
  scholarshipTableWrapperClassName,
  wishlistMobileListClassName,
  wishlistTableClassName,
  wishlistTableWrapperClassName,
} from "../features/scholarships/components/ScholarshipListViews";

export default function ScholarshipRouteFallback({ wishlist = false }) {
  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-5 pb-10 pt-5">
      <div className="mb-6 border-b border-gray-300 pb-4">
        <div
          className="mx-auto h-9 w-44 animate-pulse rounded bg-slate-100"
          aria-hidden="true"
        />
      </div>
      <SkeletonTable
        rows={wishlist ? 5 : 10}
        columns={5}
        wrapperClassName={
          wishlist ? wishlistTableWrapperClassName : scholarshipTableWrapperClassName
        }
        tableClassName={wishlist ? wishlistTableClassName : scholarshipTableClassName}
        align={wishlist ? "center" : "left"}
      />
      <SkeletonCardGrid
        count={wishlist ? 3 : 4}
        className={wishlist ? wishlistMobileListClassName : scholarshipMobileListClassName}
        variant="scholarship"
        actionCount={wishlist ? 3 : 2}
      />
    </div>
  );
}

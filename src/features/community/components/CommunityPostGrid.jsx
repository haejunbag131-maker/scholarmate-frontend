import {
  FaBookmark,
  FaHeart,
  FaRegBookmark,
  FaRegHeart,
  FaShareAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { SkeletonCardGrid } from "../../../shared/components/Skeleton";

function Avatar({ username }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,#fff)] text-xs font-bold text-[var(--color-secondary)]">
      {username?.[0]?.toUpperCase() || "U"}
    </div>
  );
}

function PostCard({
  post,
  liking,
  bookmarking,
  onLike,
  onBookmark,
  onShare,
}) {
  const visibleTags = (post.tags || []).slice(0, 3);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-lg max-md:p-4">
      <Link to={`/community/${post.id}`} className="flex flex-1 flex-col text-gray-900">
        <div className="mb-2 line-clamp-1 text-sm sm:text-base font-bold">
          {post.scholarship_name || "장학금"}
        </div>
        <div className="mb-2 flex items-center">
          <Avatar username={post.author?.username} />
          <div className="ml-2 min-w-0">
            <div className="truncate text-sm font-semibold">
              {post.author?.username || "사용자"}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <h2 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug">
          {post.title || "제목 없음"}
        </h2>
        <p className="mb-2.5 line-clamp-2 flex-1 text-sm leading-snug text-gray-700">
          {post.content}
        </p>
        <div className="mb-3 flex gap-1 overflow-hidden">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,#fff)] px-2 py-0.5 text-xs text-[var(--color-primary)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between border-t pt-2 text-sm text-gray-700">
        <button
          type="button"
          onClick={(event) => onLike(post, event)}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 py-1 font-extrabold text-slate-600 hover:border-transparent hover:bg-gray-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label={post._liked ? "좋아요 취소" : "좋아요"}
        >
          {liking ? (
            <span aria-hidden="true">…</span>
          ) : post._liked ? (
            <FaHeart className="h-4 w-4 text-rose-500" aria-hidden="true" />
          ) : (
            <FaRegHeart className="h-4 w-4 text-gray-500" aria-hidden="true" />
          )}
          <span>{post.likes_count ?? 0}</span>
        </button>
        <button
          type="button"
          onClick={(event) => onBookmark(post, event)}
          className="inline-flex min-h-8 items-center rounded-md px-2 py-1 font-extrabold text-slate-600 hover:border-transparent hover:bg-gray-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label={post._bookmarked ? "북마크 취소" : "북마크"}
        >
          {bookmarking ? (
            <span aria-hidden="true">…</span>
          ) : post._bookmarked ? (
            <FaBookmark className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
          ) : (
            <FaRegBookmark className="h-4 w-4 text-gray-500" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={(event) => onShare(post, event)}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 py-1 font-extrabold text-slate-600 hover:border-transparent hover:bg-gray-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="공유"
        >
          <FaShareAlt className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
          공유
        </button>
      </div>
    </article>
  );
}

export default function CommunityPostGrid({
  loading,
  items,
  total,
  viewMode,
  isLiking,
  isBookmarking,
  onLike,
  onBookmark,
  onShare,
}) {
  return (
    <div className="mx-auto w-[calc(100%-40px)] max-w-[var(--page-max-width)] flex-1 py-6 max-lg:max-w-[760px] max-md:w-[calc(100%-28px)] max-md:pt-[22px] max-[480px]:w-[calc(100%-24px)]">
      <h2 className="mb-4 text-lg font-bold tracking-normal text-gray-950 sm:text-2xl">
        게시글 <span className="text-gray-500 text-sm sm:text-base">({total}건)</span>
      </h2>

      {loading ? (
        <SkeletonCardGrid
          count={6}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
          cardClassName="rounded-2xl border-gray-200 shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {items.length > 0 ? (
            items.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                liking={isLiking(post.id)}
                bookmarking={isBookmarking(post.id)}
                onLike={onLike}
                onBookmark={onBookmark}
                onShare={onShare}
              />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-gray-500">
              {viewMode === "bookmarks" ? "북마크한 게시글이 없습니다." : "표시할 게시글이 없습니다."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

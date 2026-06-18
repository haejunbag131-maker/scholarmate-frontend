import {
  FaBookmark,
  FaHeart,
  FaRegBookmark,
  FaRegHeart,
  FaShareAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function PostSkeleton() {
  return (
    <div className="h-full rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
      <div className="mt-4 flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

function Avatar({ username }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
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
  return (
    <article className="community-post-card flex h-full flex-col rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/community/${post.id}`} className="flex flex-1 flex-col text-gray-900">
        <div className="mb-2 text-base sm:text-lg font-bold">
          {post.scholarship_name || "장학금"}
        </div>
        <div className="mb-3 flex items-center">
          <Avatar username={post.author?.username} />
          <div className="ml-2 min-w-0">
            <div className="truncate text-sm sm:text-base font-semibold">
              {post.author?.username || "사용자"}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <h2 className="mb-2 line-clamp-2 text-sm sm:text-base font-semibold">
          {post.title || "제목 없음"}
        </h2>
        <p className="mb-3 line-clamp-3 flex-1 text-sm sm:text-base text-gray-700">
          {post.content}
        </p>
        <div className="mb-4 flex gap-1 overflow-x-auto no-scrollbar">
          {(post.tags || []).map((tag) => (
            <span
              key={tag}
              className="whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-xs sm:text-sm text-blue-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Link>
      <div className="community-card-actions mt-auto flex items-center justify-around border-t pt-3 text-sm text-gray-700">
        <button
          type="button"
          onClick={(event) => onLike(post, event)}
          className="community-card-action inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-gray-100"
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
          className="community-card-action inline-flex items-center rounded-md px-2 py-1 hover:bg-gray-100"
          aria-label={post._bookmarked ? "북마크 취소" : "북마크"}
        >
          {bookmarking ? (
            <span aria-hidden="true">…</span>
          ) : post._bookmarked ? (
            <FaBookmark className="h-4 w-4 text-blue-600" aria-hidden="true" />
          ) : (
            <FaRegBookmark className="h-4 w-4 text-gray-500" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={(event) => onShare(post, event)}
          className="community-card-action inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-gray-100"
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
    <div className="community-post-section w-full px-5 py-6 sm:px-6 flex-1">
      <h2 className="community-post-title text-lg sm:text-2xl font-bold mb-4">
        게시글 <span className="text-gray-500 text-sm sm:text-base">({total}건)</span>
      </h2>

      <div className="community-post-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 6 }, (_, index) => <PostSkeleton key={index} />)
        ) : items.length > 0 ? (
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
    </div>
  );
}

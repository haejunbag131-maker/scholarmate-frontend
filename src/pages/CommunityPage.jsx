import { lazy, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  bookmarkPost,
  likePost,
  listBookmarkedPosts,
  listPosts,
  unbookmarkPost,
  unlikePost,
} from "../api/community";
import { fetchMe } from "../api/user";
import CommunityPagination from "../features/community/components/CommunityPagination";
import CommunityPostGrid from "../features/community/components/CommunityPostGrid";
import CommunityToast from "../features/community/components/CommunityToast";
import CommunityToolbar from "../features/community/components/CommunityToolbar";
import useToast from "../shared/hooks/useToast";
import "../assets/css/community.css";

const PostComposeModal = lazy(() => import("../components/community/PostComposeModal"));

export default function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState(
    searchParams.get("view") === "bookmarks" ? "bookmarks" : "all"
  );
  const [category, setCategory] = useState(searchParams.get("category") || "story");
  const [order, setOrder] = useState(searchParams.get("order") || "latest");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [pageSize, setPageSize] = useState(Number(searchParams.get("page_size") || 12));
  const [me, setMe] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [pendingLike, setPendingLike] = useState(() => new Set());
  const [pendingBookmark, setPendingBookmark] = useState(() => new Set());
  const { toast, showToast } = useToast();

  const ordering = order === "popular" ? "-view_count" : "-created_at";

  const syncQuery = (next = {}) => {
    const params = new URLSearchParams({
      view: next.viewMode ?? viewMode,
      category: next.category ?? category,
      order: next.order ?? order,
      q: next.q ?? q,
      page: String(next.page ?? page),
      page_size: String(next.pageSize ?? pageSize),
    });
    setSearchParams(params);
  };

  const load = async () => {
    setLoading(true);
    try {
      const fetcher = viewMode === "bookmarks" ? listBookmarkedPosts : listPosts;
      const result = await fetcher({ category, q, page, pageSize, ordering });
      const mapped = (result.items || []).map((post) => ({
        ...post,
        _liked: Boolean(post.is_liked),
        _bookmarked: Boolean(post.is_bookmarked),
      }));
      setItems(mapped);
      setTotal(result.total);
    } catch (error) {
      console.error(error);
      showToast("목록을 불러오지 못했습니다.", "error");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setMe(await fetchMe());
      } catch {
        setMe(null);
      }
    })();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, category, q, page, pageSize, order]);

  const doSearch = () => {
    const nextQuery = searchInput.trim();
    setQ(nextQuery);
    setPage(1);
    syncQuery({ q: nextQuery, page: 1 });
  };

  const clearSearch = () => {
    setSearchInput("");
    setQ("");
    setPage(1);
    syncQuery({ q: "", page: 1 });
  };

  const changeOrder = (nextOrder) => {
    setOrder(nextOrder);
    setPage(1);
    syncQuery({ order: nextOrder, page: 1 });
  };

  const changeViewMode = (nextViewMode) => {
    setViewMode(nextViewMode);
    setPage(1);
    syncQuery({ viewMode: nextViewMode, page: 1 });
  };

  const changeCategory = (nextCategory) => {
    setCategory(nextCategory);
    setPage(1);
    syncQuery({ category: nextCategory, page: 1 });
  };

  const onChangePage = (nextPage, nextPageSize) => {
    setPage(nextPage);
    if (nextPageSize !== pageSize) setPageSize(nextPageSize);
    syncQuery({ page: nextPage, pageSize: nextPageSize });
  };

  const onShowSizeChange = (nextPageSize) => {
    setPageSize(nextPageSize);
    setPage(1);
    syncQuery({ page: 1, pageSize: nextPageSize });
  };

  const requireAuth = (actionName = "이 기능") => {
    if (!me) {
      showToast(`${actionName}은(는) 로그인 후 이용 가능합니다.`, "info");
      return false;
    }
    return true;
  };

  const updateItem = (id, updater) => {
    setItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const handleLike = async (post, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!requireAuth("좋아요")) return;
    if (pendingLike.has(post.id)) return;

    const nextLiked = !post._liked;
    updateItem(post.id, (item) => ({
      ...item,
      _liked: nextLiked,
      likes_count: Math.max(0, (item.likes_count || 0) + (nextLiked ? 1 : -1)),
    }));

    setPendingLike((current) => new Set(current).add(post.id));
    try {
      if (nextLiked) await likePost(post.id);
      else await unlikePost(post.id);
    } catch {
      updateItem(post.id, (item) => ({
        ...item,
        _liked: !nextLiked,
        likes_count: Math.max(0, (item.likes_count || 0) + (nextLiked ? -1 : 1)),
      }));
      showToast("좋아요 처리 실패", "error");
    } finally {
      setPendingLike((current) => {
        const next = new Set(current);
        next.delete(post.id);
        return next;
      });
    }
  };

  const handleBookmark = async (post, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!requireAuth("북마크")) return;
    if (pendingBookmark.has(post.id)) return;

    const nextBookmarked = !post._bookmarked;
    updateItem(post.id, (item) => ({ ...item, _bookmarked: nextBookmarked }));

    setPendingBookmark((current) => new Set(current).add(post.id));
    try {
      if (nextBookmarked) await bookmarkPost(post.id);
      else await unbookmarkPost(post.id);
    } catch {
      updateItem(post.id, (item) => ({ ...item, _bookmarked: !nextBookmarked }));
      showToast("북마크 처리 실패", "error");
    } finally {
      setPendingBookmark((current) => {
        const next = new Set(current);
        next.delete(post.id);
        return next;
      });
      if (viewMode === "bookmarks" && !nextBookmarked) {
        setItems((prev) => prev.filter((item) => item.id !== post.id));
        setTotal((currentTotal) => Math.max(0, currentTotal - 1));
      }
    }
  };

  const handleShare = async (post, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    const shareUrl = `${window.location.origin}/community/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast("링크 복사 완료", "success");
      }
    } catch {
      showToast("공유 실패", "error");
    }
  };

  return (
    <div className="community-page min-h-screen bg-gray-50 font-sans flex flex-col">
      <CommunityToolbar
        order={order}
        viewMode={viewMode}
        category={category}
        searchInput={searchInput}
        isLoggedIn={Boolean(me)}
        onOrderChange={changeOrder}
        onViewModeChange={changeViewMode}
        onCategoryChange={changeCategory}
        onSearchInputChange={setSearchInput}
        onSearch={doSearch}
        onClearSearch={clearSearch}
        onOpenCompose={() => setComposeOpen(true)}
      />

      <CommunityPostGrid
        loading={loading}
        items={items}
        total={total}
        viewMode={viewMode}
        isLiking={(id) => pendingLike.has(id)}
        isBookmarking={(id) => pendingBookmark.has(id)}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
      />

      <CommunityPagination
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onChangePage}
        onPageSizeChange={onShowSizeChange}
      />

      {composeOpen && (
        <Suspense fallback={null}>
          <PostComposeModal
            open={composeOpen}
            onClose={() => setComposeOpen(false)}
            onCreated={() => {
              setComposeOpen(false);
              setPage(1);
              load();
            }}
            defaultCategory={category}
          />
        </Suspense>
      )}

      <CommunityToast toast={toast} />
    </div>
  );
}

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaChevronRight, FaHeart, FaRegCommentDots, FaRegEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { queryKeys } from "../../shared/queryKeys";
import { SkeletonList } from "../../shared/components/Skeleton";

// YYYY.MM.DD
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

// 응답 정규화
const normalizeList = (raw) => {
  const list = Array.isArray(raw) ? raw : raw?.results ?? [];
  return list.map((it) => ({
    id: it.id ?? it.pk ?? it.post_id,
    title: it.title ?? it.scholarshipName ?? it.name ?? "제목 없음",
    scholarship_name: it.scholarship_name ?? it.scholarshipName ?? it.scholarship ?? "",
    created_at:
      it.created_at ?? it.createdAt ?? it.created ?? it.updated_at ?? new Date().toISOString(),
    like_count: it.like_count ?? it.likes_count ?? it.likes ?? it.likeCount ?? 0,
    comment_count: it.comment_count ?? it.comments_count ?? it.comments ?? it.commentCount ?? 0,
    view_count: it.view_count ?? it.views ?? it.viewCount ?? 0,
  }));
};

const Stat = ({ icon: Icon, value, title }) => (
  <span className="text-xs text-gray-600 flex items-center gap-1" title={title}>
    <Icon className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
    {value}
  </span>
);

const PUBLIC_REQUEST = {
  skipAuth: true,
  skipAuthRedirect: true,
};

async function fetchCommunityLatest() {
  const res = await axios.get("/community/posts/", {
    params: { page_size: 10, ordering: "-created_at" },
    ...PUBLIC_REQUEST,
  });
  const items = normalizeList(res.data);
  return items;
}

async function fetchCommunityPopular() {
  const res = await axios.get("/community/posts/", {
    params: { page_size: 20 },
    ...PUBLIC_REQUEST,
  });
  const list = normalizeList(res.data);
  return (
    list
      .map((post) => ({
        ...post,
        score: (post.view_count || 0) + (post.like_count || 0) * 2,
      }))
      .sort((a, b) => b.score - a.score)[0] ?? null
  );
}

async function fetchHomeNotices() {
  const { data } = await axios.get("/notices/", {
    params: { page_size: 20, ordering: "-is_pinned,-created_at" },
    ...PUBLIC_REQUEST,
  });
  const items = data?.results ?? [];
  const pinnedItem = items.find((notice) => notice.is_pinned) ?? null;
  const latestItems = items
    .filter((notice) => !notice.is_pinned)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return { pinnedItem, latestItems };
}

const getErrorLabel = (error) => error?.response?.status || "FETCH_ERROR";
const EMPTY_LIST = [];
const Chevron = () => (
  <FaChevronRight className="mr-[8px] text-[#111] shrink-0" aria-hidden="true" />
);

const CommunityNotice = () => {
  const communityQuery = useQuery({
    queryKey: queryKeys.home.communityLatest,
    queryFn: fetchCommunityLatest,
  });
  const popularQuery = useQuery({
    queryKey: queryKeys.home.communityPopular,
    queryFn: fetchCommunityPopular,
  });
  const noticeQuery = useQuery({
    queryKey: queryKeys.home.notices,
    queryFn: fetchHomeNotices,
  });

  const communityItems = communityQuery.data ?? EMPTY_LIST;
  const popularItem = popularQuery.data ?? null;
  const pinnedItem = noticeQuery.data?.pinnedItem ?? null;
  const latestItems = noticeQuery.data?.latestItems ?? EMPTY_LIST;
  const communityLoading = communityQuery.isPending;
  const popularLoading = popularQuery.isPending;
  const noticeLoading = noticeQuery.isPending;
  const communityError = communityQuery.isError ? getErrorLabel(communityQuery.error) : null;
  const noticeError = noticeQuery.isError ? getErrorLabel(noticeQuery.error) : null;

  const communityLatestForRender = useMemo(() => {
    const base = [...communityItems];
    const filtered = popularItem ? base.filter((p) => p.id !== popularItem.id) : base;
    const isMobile = window.innerWidth < 640;
    return popularItem
      ? filtered.slice(0, isMobile ? 2 : 4)
      : filtered.slice(0, isMobile ? 3 : 5);
  }, [communityItems, popularItem]);

  const latestForNotice = useMemo(() => {
    const isMobile = window.innerWidth < 640;
    return pinnedItem
      ? latestItems.slice(0, isMobile ? 2 : 4)
      : latestItems.slice(0, isMobile ? 3 : 5);
  }, [latestItems, pinnedItem]);

  return (
    <div className="mx-auto mt-[40px] mb-[60px] w-full px-4 sm:px-6 lg:w-[80%] lg:max-w-[1200px]">
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:gap-5 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0">
        {/* 커뮤니티 */}
        <div className="w-[86vw] min-w-[86vw] snap-center min-h-[340px] bg-white p-4 rounded-[12px] border border-gray-300 shadow transition-transform hover:-translate-y-1 sm:w-[78vw] sm:min-w-[78vw] sm:min-h-[360px] sm:p-6 lg:w-full lg:min-w-0">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-gray-300">
              <h3 className="text-base sm:text-lg md:text-[1.2rem] font-bold text-gray-900">
                커뮤니티
              </h3>
              <Link to="/community" className="text-xs sm:text-sm text-[#111] hover:underline">
                더보기 +
              </Link>
            </div>

            {/* 인기글 강조 */}
            {!popularLoading && popularItem && (
              <>
                <div className="mb-3 p-3 rounded-md bg-blue-50 border border-blue-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center min-w-0">
                      <Chevron />
                      <Link
                        to={`/community/${popularItem.id}`}
                        className="text-sm font-medium text-[#333] hover:underline truncate"
                        title={`${popularItem.scholarship_name ? `[${popularItem.scholarship_name}] ` : ""}${popularItem.title}`}
                      >
                        {popularItem.scholarship_name && (
                          <span className="text-[#666] mr-2">[{popularItem.scholarship_name}]</span>
                        )}
                        <span className="truncate">{popularItem.title}</span>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs">
                      <Stat icon={FaHeart} value={popularItem.like_count} title="좋아요" />
                      <Stat icon={FaRegCommentDots} value={popularItem.comment_count} title="댓글" />
                      <Stat icon={FaRegEye} value={popularItem.view_count} title="조회수" />
                      <span className="text-xs text-gray-600">{formatDate(popularItem.created_at)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full text-gray-900 border border-blue-200">
                        인기
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 my-2" />
              </>
            )}

            {/* 최신글 */}
            {communityLoading || popularLoading ? (
              <SkeletonList featured rows={4} />
            ) : communityError ? (
              <div className="text-sm text-red-600 py-3">
                프리뷰를 불러오지 못했어요. (에러: {String(communityError)})
              </div>
            ) : communityLatestForRender.length === 0 ? (
              <div className="text-sm text-gray-500 py-3">게시글이 없습니다.</div>
            ) : (
              <ul className="list-none p-0">
                {communityLatestForRender.map((post) => (
                  <li
                    key={post.id}
                    className="text-sm text-[#333] flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[#eee] hover:text-black transition-colors last:border-b-0"
                  >
                    <div className="flex items-center min-w-0">
                      <Chevron />
                      <Link
                        to={`/community/${post.id}`}
                        className="text-[#333] hover:underline truncate"
                        title={`${post.scholarship_name ? `[${post.scholarship_name}] ` : ""}${post.title}`}
                      >
                        {post.scholarship_name && (
                          <span className="text-[#666] mr-2">[{post.scholarship_name}]</span>
                        )}
                        <span className="truncate">{post.title}</span>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 mt-2 sm:mt-0 text-xs">
                      <Stat icon={FaHeart} value={post.like_count} title="좋아요" />
                      <Stat icon={FaRegCommentDots} value={post.comment_count} title="댓글" />
                      <Stat icon={FaRegEye} value={post.view_count} title="조회수" />
                      <span className="text-xs text-gray-600">{formatDate(post.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </div>

        {/* 공지사항 */}
        <div className="w-[86vw] min-w-[86vw] snap-center min-h-[340px] bg-white p-4 rounded-[12px] border border-gray-300 shadow transition-transform hover:-translate-y-1 sm:w-[78vw] sm:min-w-[78vw] sm:min-h-[360px] sm:p-6 lg:w-full lg:min-w-0">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-gray-300">
              <h3 className="text-base sm:text-lg md:text-[1.2rem] font-bold text-gray-900">
                공지사항
              </h3>
              <Link to="/notice" className="text-xs sm:text-sm text-[#111] hover:underline">
                더보기 +
              </Link>
            </div>
            {noticeLoading ? (
              <SkeletonList featured rows={4} />
            ) : noticeError ? (
              <div className="text-sm text-red-600 py-3">
                공지사항을 불러오지 못했어요. (에러: {String(noticeError)})
              </div>
            ) : (
              <>
                {pinnedItem && (
                  <div className="mb-3 p-3 rounded-md bg-blue-50 border border-blue-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center min-w-0">
                        <Chevron />
                        <Link
                          to={`/notice/${pinnedItem.id}`}
                          className="text-sm font-medium text-[#333] hover:underline truncate"
                          title={pinnedItem.title}
                        >
                          {pinnedItem.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-xs">
                        <span className="text-xs text-gray-600">{formatDate(pinnedItem.created_at)}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full text-gray-900 border border-blue-200">
                          고정
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {pinnedItem && <div className="border-t border-gray-200 my-2" />}
                <ul className="list-none p-0">
                  {latestForNotice.map((n) => (
                    <li
                      key={n.id}
                      className="text-sm text-[#333] flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[#eee] hover:text-black transition-colors last:border-b-0"
                    >
                      <div className="flex items-center min-w-0">
                        <Chevron />
                        <Link
                          to={`/notice/${n.id}`}
                          className="text-[#333] hover:underline truncate"
                          title={n.title}
                        >
                          {n.title}
                        </Link>
                      </div>
                      <span className="text-xs text-gray-600 mt-1 sm:mt-0 ml-0 sm:ml-2 shrink-0">
                        {formatDate(n.created_at)}
                      </span>
                    </li>
                  ))}
                  {!pinnedItem && latestForNotice.length === 0 && (
                    <li className="text-sm text-gray-500 py-3">공지사항이 없습니다.</li>
                  )}
                </ul>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default CommunityNotice;

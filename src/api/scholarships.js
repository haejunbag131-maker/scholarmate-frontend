import api from "./axios";

const TYPE_KR = {
  regional: "지역연고",
  academic: "성적우수",
  income_based: "소득구분",
  special_talent: "특기자",
  other: "기타",
};

function parseListResponse(data) {
  if (Array.isArray(data)) return { items: data, count: data.length };
  if (data && Array.isArray(data.results)) {
    return { items: data.results, count: data.count ?? data.results.length };
  }
  if (data && Array.isArray(data.data)) {
    const count = data.total ?? data.count ?? data.data.length;
    return { items: data.data, count };
  }
  return { items: [], count: 0 };
}

export async function fetchScholarships({
  page,
  perPage,
  searchQuery,
  selectedType,
  sortOrder,
}) {
  const typeParam = selectedType ? (TYPE_KR[selectedType] ?? selectedType) : undefined;
  const params = {
    page,
    perPage: Number.isFinite(perPage) ? perPage : 10,
    search: (searchQuery || "").trim() || undefined,
    type: typeParam,
    sort: (sortOrder || "").trim() || undefined,
  };

  const { data } = await api.get("/scholarships/", { params });
  const { items, count } = parseListResponse(data);
  const normalizedItems = items.map((item) => ({
    ...item,
    id: item.product_id,
  }));

  return {
    items: normalizedItems,
    totalCount: Number.isFinite(count) ? count : normalizedItems.length,
  };
}

export async function fetchScholarshipWishlist() {
  const { data } = await api.get("/scholarships/wishlist/");
  const ids = (data || []).map((item) => item.scholarship.product_id);
  return new Set(ids);
}

export async function fetchWishlistItems() {
  const { data } = await api.get("/scholarships/wishlist/");
  return data || [];
}

export async function fetchRecommendations() {
  const { data } = await api.get("/scholarships/recommendation/");
  return Array.isArray(data?.scholarships) ? data.scholarships : [];
}

export async function toggleScholarshipWishlist({ item, isFavorited }) {
  const productId = item.product_id ?? item.id;
  const url = isFavorited
    ? "/scholarships/wishlist/toggle/"
    : "/scholarships/wishlist/add-from-api/";
  const payload = isFavorited ? { product_id: productId, action: "remove" } : item;
  const { status } = await api.post(url, payload);

  if (status !== 200 && status !== 201) {
    throw new Error("서버 오류");
  }

  return { productId, isFavorited };
}

export async function deleteWishlistItem(scholarshipId) {
  await api.delete(`/scholarships/wishlist/delete/${scholarshipId}/`);
  return scholarshipId;
}

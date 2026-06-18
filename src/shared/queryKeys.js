export const queryKeys = {
  auth: {
    me: ["auth", "me"],
  },
  home: {
    communityLatest: ["home", "community", "latest"],
    communityPopular: ["home", "community", "popular"],
    notices: ["home", "notices"],
  },
  notices: {
    all: ["notices"],
    list: (params) => ["notices", "list", params],
    detail: (id) => ["notices", "detail", id],
  },
  scholarships: {
    all: ["scholarships"],
    list: (params) => ["scholarships", "list", params],
    favorites: ["scholarships", "favorites"],
    wishlist: ["scholarships", "wishlist"],
    recommendations: ["scholarships", "recommendations"],
  },
};

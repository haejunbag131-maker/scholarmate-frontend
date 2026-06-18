export function getPageList(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [];
  const push = (page) => {
    if (pages[pages.length - 1] !== page) pages.push(page);
  };
  const ellipsis = () => {
    if (pages[pages.length - 1] !== "…") pages.push("…");
  };

  push(1);
  push(2);

  const start = Math.max(3, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);
  if (start > 3) ellipsis();
  for (let page = start; page <= end; page += 1) push(page);
  if (end < totalPages - 2) ellipsis();

  push(totalPages - 1);
  push(totalPages);
  return pages;
}

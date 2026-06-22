function SkeletonBlock({ className = "" }) {
  return (
    <span
      className={["block animate-pulse rounded bg-slate-100", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}

function SkeletonCard({ className = "", variant = "default", actionCount = 2 }) {
  if (variant === "scholarship") {
    return (
      <article
        className={[
          "relative overflow-hidden rounded-[18px] border border-gray-200 bg-white px-5 py-[18px] text-left shadow-[0_8px_22px_rgba(15,23,42,0.07)] before:absolute before:left-0 before:top-0 before:h-1 before:w-full before:bg-slate-200 max-[480px]:rounded-2xl max-[480px]:p-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <SkeletonBlock className="absolute right-4 top-4 h-9 w-9 rounded-full max-[480px]:right-3.5 max-[480px]:top-3.5" />
        <div className="pr-12">
          <SkeletonBlock className="h-3.5 w-28" />
          <SkeletonBlock className="mt-3 h-5 w-3/4" />
          <SkeletonBlock className="mt-3 h-7 w-52 max-w-full rounded-full" />
        </div>
        <div
          className={[
            "mt-4 grid gap-2",
            actionCount >= 3 ? "grid-cols-3" : "grid-cols-2",
          ].join(" ")}
        >
          {Array.from({ length: actionCount }, (_, index) => (
            <SkeletonBlock key={index} className="h-9 rounded-lg" />
          ))}
        </div>
      </article>
    );
  }

  return (
    <article
      className={[
        "rounded-lg border border-slate-100 bg-white p-4 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <SkeletonBlock className="h-5 w-1/2" />
      <div className="mt-4 flex items-center gap-3">
        <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-4 w-2/3" />
      </div>
      <div className="mt-5 flex gap-2">
        <SkeletonBlock className="h-8 w-20" />
        <SkeletonBlock className="h-8 w-24" />
      </div>
    </article>
  );
}

export function SkeletonCardGrid({
  count = 6,
  className = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
  cardClassName = "",
  variant = "default",
  actionCount = 2,
}) {
  return (
    <div className={className} aria-label="콘텐츠를 불러오는 중" role="status">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard
          key={index}
          className={cardClassName}
          variant={variant}
          actionCount={actionCount}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 6,
  columns = 5,
  wrapperClassName = "hidden md:block overflow-x-auto",
  tableClassName = "w-full",
  align = "left",
}) {
  const alignmentClassName = align === "center" ? "text-center" : "text-left";
  const cellClassName = [
    "border border-gray-200 px-3 py-4",
    alignmentClassName,
  ].join(" ");
  const headerCellClassName = [
    "border border-gray-200 bg-gray-50 px-3 py-3",
    alignmentClassName,
  ].join(" ");

  return (
    <div
      className={[wrapperClassName, "rounded-lg border border-gray-200 bg-white shadow-sm"].join(" ")}
      aria-label="표를 불러오는 중"
      role="status"
    >
      <table className={tableClassName}>
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <th key={index} className={headerCellClassName}>
                <SkeletonBlock
                  className={[
                    "h-4",
                    align === "center" ? "mx-auto" : "",
                    index === 1 ? "w-32" : "w-24",
                  ].join(" ")}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }, (_, columnIndex) => (
                <td key={columnIndex} className={cellClassName}>
                  <SkeletonBlock
                    className={[
                      columnIndex >= columns - 2
                        ? "h-9 w-28 rounded-lg"
                        : columnIndex === 1
                          ? "h-4 w-2/3"
                          : "h-4 w-full",
                      align === "center" || columnIndex >= columns - 2 ? "mx-auto" : "",
                    ].join(" ")}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonList({
  rows = 5,
  featured = false,
  className = "",
}) {
  return (
    <div
      className={["w-full", className].filter(Boolean).join(" ")}
      aria-label="목록을 불러오는 중"
      role="status"
    >
      {featured && (
        <>
          <div className="mb-3 rounded-md border border-slate-100 bg-slate-50 p-3">
            <SkeletonBlock className="h-5 w-3/4" />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-3 w-16" />
              <SkeletonBlock className="h-3 w-14" />
            </div>
          </div>
          <div className="my-2 border-t border-slate-100" />
        </>
      )}

      <ul className="list-none p-0">
        {Array.from({ length: rows }, (_, index) => (
          <li key={index} className="border-b border-slate-100 py-3 last:border-b-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="mt-2 h-3 w-1/2" />
              </div>
              <SkeletonBlock className="h-3 w-24 shrink-0" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

function SkeletonCard({ className = "" }) {
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
}) {
  return (
    <div className={className} aria-label="콘텐츠를 불러오는 중" role="status">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} className={cardClassName} />
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 6,
  columns = 5,
  wrapperClassName = "hidden md:block overflow-x-auto",
  tableClassName = "w-full",
}) {
  return (
    <div className={wrapperClassName} aria-label="표를 불러오는 중" role="status">
      <table className={tableClassName}>
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <th key={index}>
                <SkeletonBlock className="mx-auto h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }, (_, columnIndex) => (
                <td key={columnIndex}>
                  <SkeletonBlock
                    className={columnIndex >= columns - 2 ? "mx-auto h-8 w-24" : "h-4 w-full"}
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

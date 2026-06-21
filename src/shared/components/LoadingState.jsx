export default function LoadingState({
  message = "불러오는 중...",
  minHeight = "160px",
  compact = false,
  className = "",
}) {
  const classes = [
    "loading-state",
    compact ? "loading-state--compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{ "--loading-state-min-height": minHeight }}
      role="status"
      aria-live="polite"
    >
      <span className="loading-state__spinner" aria-hidden="true" />
      {message && <span className="loading-state__message">{message}</span>}
    </div>
  );
}

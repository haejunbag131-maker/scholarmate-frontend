import { useEffect, useId } from "react";

function useBodyScrollLock() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);
}

export default function Modal({
  title,
  titleTag: TitleTag = "h2",
  onClose,
  children,
  footer,
  maxWidth = "860px",
  topOffset = 96,
  className = "",
  bodyClassName = "",
  showCloseButton = false,
}) {
  useBodyScrollLock();

  const titleId = useId();
  const modalTop = Math.max(40, topOffset);
  const resolvedFooter =
    footer === undefined ? (
      <button
        type="button"
        onClick={onClose}
        className="h-9 rounded-md border border-gray-300 px-3 text-xs hover:bg-gray-50 sm:h-10 sm:px-4 sm:text-sm"
      >
        닫기
      </button>
    ) : (
      footer
    );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="ui-modal-overlay"
      style={{ paddingTop: modalTop, paddingBottom: 24 }}
      onClick={onClose}
    >
      <section
        className={["ui-modal", className].filter(Boolean).join(" ")}
        style={{ maxWidth, maxHeight: `calc(100vh - ${modalTop + 24}px)` }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {showCloseButton && (
          <button
            type="button"
            className="ui-modal-close"
            onClick={onClose}
            aria-label="모달 닫기"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}

        {title && (
          <TitleTag id={titleId} className="ui-modal-title">
            {title}
          </TitleTag>
        )}

        <div className={["ui-modal-body", bodyClassName].filter(Boolean).join(" ")}>
          {children}
        </div>

        {resolvedFooter && <div className="ui-modal-footer">{resolvedFooter}</div>}
      </section>
    </div>
  );
}

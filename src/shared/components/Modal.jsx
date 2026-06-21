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
}) {
  useBodyScrollLock();

  const titleId = useId();
  const modalTop = Math.max(40, topOffset);

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
        <button
          type="button"
          className="ui-modal-close"
          onClick={onClose}
          aria-label="모달 닫기"
        >
          <span aria-hidden="true">×</span>
        </button>

        {title && (
          <TitleTag id={titleId} className="ui-modal-title">
            {title}
          </TitleTag>
        )}

        <div className={["ui-modal-body", bodyClassName].filter(Boolean).join(" ")}>
          {children}
        </div>

        {footer && <div className="ui-modal-footer">{footer}</div>}
      </section>
    </div>
  );
}

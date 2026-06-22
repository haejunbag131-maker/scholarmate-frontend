export default function ScholarshipToast({ toast }) {
  const toastType = toast.type || "success";
  const typeClassName =
    toastType === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : toastType === "info"
        ? "border-blue-200 bg-blue-50 text-blue-900"
        : "border-emerald-200 bg-emerald-50 text-emerald-900";

  return (
    <div aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-[60]">
      {toast.open && (
        <div
          className={[
            "min-w-60 max-w-[360px] rounded-[10px] border px-4 py-3 text-sm shadow-[0_6px_24px_rgba(0,0,0,0.12)]",
            typeClassName,
          ].join(" ")}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

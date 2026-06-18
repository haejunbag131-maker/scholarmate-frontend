export default function CalendarToast({ toast }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-[120]">
      {toast.open && (
        <div
          className={[
            "min-w-[220px] max-w-[360px] rounded-lg border px-4 py-3 text-sm shadow-lg",
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-sky-200 bg-sky-50 text-sky-900",
          ].join(" ")}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

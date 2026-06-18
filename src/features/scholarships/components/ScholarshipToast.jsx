export default function ScholarshipToast({ toast }) {
  const toastType = toast.type || "success";

  return (
    <div aria-live="polite" aria-atomic="true" className="toast-root">
      {toast.open && (
        <div className={`toast-card toast-${toastType}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}

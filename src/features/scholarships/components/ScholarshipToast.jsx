export default function ScholarshipToast({ toast }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="toast-root">
      {toast.open && (
        <div className={`toast-card ${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}

import PageShell from "../../../shared/components/PageShell";

export default function RecommendationShell({ toast, children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <PageShell width="narrow" className="recommendation-shell">
        <section className="recommendation-panel">
          {children}
        </section>
      </PageShell>

      <div aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-[60]">
        {toast.open && (
          <div
            className={[
              "min-w-[220px] max-w-[340px] px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg border text-sm",
              "animate-[fadeIn_.15s_ease-out]",
              "bg-white border-[var(--color-secondary)] text-[var(--color-primary)]",
            ].join(" ")}
            role="status"
          >
            {toast.message}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default function RecommendationShell({ toast, children }) {
  return (
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: "20px" }}>
      <div className="w-full max-w-full px-4 sm:px-4 flex justify-center">
        <section className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-5 sm:p-8">
          {children}
        </section>
      </div>

      <div aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-[60]">
        {toast.open && (
          <div
            className={[
              "min-w-[220px] max-w-[340px] px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg border text-sm",
              "animate-[fadeIn_.15s_ease-out]",
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-sky-50 border-sky-200 text-sky-900",
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

export default function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative h-full w-full flex justify-center items-start pt-20 sm:pt-24 p-3 sm:p-4">
        <div
          className="relative w-full max-w-[520px] bg-white rounded-xl shadow-lg border border-gray-200 p-5 sm:p-6 max-h-[85vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-900">{title}</h3>
          {children}
          <div className="mt-5 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-md border border-gray-300 text-xs sm:text-sm hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

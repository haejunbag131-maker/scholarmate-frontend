import { extractReasons } from "../utils/reasons";

export default function RecommendationReasonModal({ scholarship, headerPad, onClose }) {
  const reasons = extractReasons(scholarship.Reason ?? scholarship.reason ?? scholarship.reasons);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 overflow-y-auto"
      style={{ paddingTop: headerPad + 24, paddingBottom: 24 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-xl p-6 relative"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recommendation-reason-title"
      >
        <button
          className="absolute right-4 top-3 text-sm font-bold text-gray-700 hover:text-black"
          onClick={onClose}
          aria-label="선별 이유 닫기"
        >
          닫기
        </button>

        <h3 id="recommendation-reason-title" className="text-xl font-bold mb-4">
          선별 이유
        </h3>

        {reasons.length ? (
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
            {reasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{String(reason)}</li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">선별 이유 정보가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

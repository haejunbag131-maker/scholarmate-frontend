import {
  FaBan,
  FaBell,
  FaBellSlash,
  FaCheckCircle,
  FaCopy,
  FaGraduationCap,
} from "react-icons/fa";

export default function CalendarEventModal({
  event,
  submitted,
  alertEnabled,
  onClose,
  onCopyDocuments,
  onSubmitComplete,
  onSubmitCancel,
  onAlertRegister,
  onAlertCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[420px] animate-[fadeIn_0.2s_ease-in-out] rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-[480px]:p-5"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-event-title"
      >
        <h2 id="calendar-event-title" className="mb-4 flex items-center gap-2 text-xl font-bold">
          <FaGraduationCap className="h-5 w-5 text-blue-700" aria-hidden="true" />
          {event.title}
        </h2>

        <p className="mb-1 font-semibold">제출 서류</p>
        <div className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-800">
          {event.required_documents_details?.trim() || "제출 서류 정보가 없습니다."}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={onCopyDocuments}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
          >
            <FaCopy aria-hidden="true" />
            복사하기
          </button>

          {submitted ? (
            <button
              onClick={onSubmitCancel}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 px-3 py-2 text-rose-700 hover:bg-rose-200"
            >
              <FaBan aria-hidden="true" />
              제출 취소
            </button>
          ) : (
            <button
              onClick={onSubmitComplete}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
            >
              <FaCheckCircle aria-hidden="true" />
              제출 완료
            </button>
          )}

          {alertEnabled ? (
            <button
              onClick={onAlertCancel}
              className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-2 text-gray-800 hover:bg-gray-200"
            >
              <FaBellSlash aria-hidden="true" />
              알림 취소
            </button>
          ) : (
            <button
              onClick={onAlertRegister}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-2 text-white hover:bg-amber-600"
            >
              <FaBell aria-hidden="true" />
              알림 등록
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded-md bg-gray-800 px-3 py-2 text-white hover:bg-black"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

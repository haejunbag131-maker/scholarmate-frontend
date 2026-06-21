import {
  FaBan,
  FaBell,
  FaBellSlash,
  FaCheckCircle,
  FaCopy,
} from "react-icons/fa";
import Modal from "../../../shared/components/Modal";

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
    <Modal
      title={event.title}
      onClose={onClose}
      maxWidth="420px"
      bodyClassName="text-gray-800"
    >
      <p className="mb-1 font-semibold">제출 서류</p>
      <div className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-800">
        {event.required_documents_details?.trim() || "제출 서류 정보가 없습니다."}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onCopyDocuments}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3 py-2 text-white hover:bg-[var(--color-secondary)]"
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
      </div>
    </Modal>
  );
}

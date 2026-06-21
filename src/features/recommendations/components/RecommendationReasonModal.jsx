import Modal from "../../../shared/components/Modal";
import { extractReasons } from "../utils/reasons";

export default function RecommendationReasonModal({ scholarship, onClose }) {
  const reasons = extractReasons(scholarship.Reason ?? scholarship.reason ?? scholarship.reasons);

  return (
    <Modal
      title="선별 이유"
      titleTag="h3"
      onClose={onClose}
      maxWidth="512px"
    >
      {reasons.length ? (
        <ul className="list-disc space-y-2 pl-5">
          {reasons.map((reason, index) => (
            <li key={`${reason}-${index}`}>{String(reason)}</li>
          ))}
        </ul>
      ) : (
        <div>선별 이유 정보가 없습니다.</div>
      )}
    </Modal>
  );
}

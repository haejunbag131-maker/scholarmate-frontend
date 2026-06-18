import { FaTimes } from "react-icons/fa";
import { getScholarshipUrl } from "../../../shared/utils/urls";

const DETAIL_ROWS = [
  ["성적 기준", "grade_criteria_details"],
  ["소득 기준", "income_criteria_details"],
  ["지원 내용", "support_details"],
  ["특정 자격", "specific_qualification_details"],
  ["지역 조건", "residency_requirement_details"],
  ["선발 방법", "selection_method_details"],
  ["선발 인원", "number_of_recipients_details"],
  ["자격 제한", "eligibility_restrictions"],
  ["제출 서류", "required_documents_details"],
];

export default function ScholarshipDetailModal({ scholarship, onClose }) {
  if (!scholarship) return null;

  const homepageUrl = getScholarshipUrl(scholarship);

  return (
    <div className="scholarship-modal-overlay" onClick={onClose}>
      <div className="scholarship-modal-content" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="scholarship-modal-close" onClick={onClose}>
          <FaTimes aria-hidden="true" />
        </button>
        <h2>{scholarship.name} 상세 정보</h2>
        <div className="scholarship-modal-body">
          {DETAIL_ROWS.map(([label, key]) => (
            <p key={key}>
              <strong>{label}:</strong> {scholarship[key] || "정보 없음"}
            </p>
          ))}
          <p>
            <strong>추천 필요 여부:</strong>{" "}
            {scholarship.recommendation_required ? "필요" : "불필요"}
          </p>
          <p>
            <strong>홈페이지:</strong>{" "}
            {homepageUrl ? (
              <a
                href={homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="scholarship-inline-action"
              >
                홈페이지 이동
              </a>
            ) : (
              <span className="text-gray-500">주소 없음</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

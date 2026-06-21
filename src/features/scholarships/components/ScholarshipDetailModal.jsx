import Button from "../../../shared/components/Button";
import DetailRows from "../../../shared/components/DetailRows";
import Modal from "../../../shared/components/Modal";
import { getScholarshipUrl } from "../../../shared/utils/urls";

const DETAIL_ROWS = [
  ["운영기관명", "foundation_name"],
  ["모집 기간", "recruitment_period"],
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
  const getDetailValue = (key) => {
    if (key === "recruitment_period") {
      const start = scholarship.recruitment_start || "-";
      const end = scholarship.recruitment_end || "-";
      return `${start} ~ ${end}`;
    }
    return scholarship[key];
  };

  const rows = [
    ...DETAIL_ROWS.map(([label, key]) => ({
      label,
      value: getDetailValue(key),
    })),
    {
      label: "추천 필요 여부",
      value:
        typeof scholarship.recommendation_required === "boolean"
          ? scholarship.recommendation_required
            ? "필요"
            : "불필요"
          : "",
    },
    {
      label: "홈페이지",
      value: homepageUrl ? (
        <Button
          as="a"
          href={homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="sm"
        >
          홈페이지 이동
        </Button>
      ) : (
        "주소 없음"
      ),
    },
  ];

  return (
    <Modal title={`${scholarship.name} 상세 정보`} onClose={onClose}>
      <DetailRows rows={rows} emptyText="정보 없음" />
    </Modal>
  );
}

import ScholarshipDetailModal from "../../scholarships/components/ScholarshipDetailModal";

export default function RecommendationDetailModal({
  scholarship,
  onClose,
}) {
  return <ScholarshipDetailModal scholarship={scholarship} onClose={onClose} />;
}

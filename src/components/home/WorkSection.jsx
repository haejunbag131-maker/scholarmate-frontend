import {
  FaChevronDown,
  FaChevronRight,
  FaClipboardList,
  FaComments,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <FaUserPlus className="text-black text-base" />,
      title: "프로필 등록",
      description: "학점, 전공, 활동 내역 등 기본 정보를 입력하세요.",
    },
    {
      icon: <FaSearch className="text-black text-base" />,
      title: "맞춤 장학금 추천",
      description: "AI가 프로필을 분석하여 적합한 장학금을 추천해 드립니다.",
    },
    {
      icon: <FaComments className="text-black text-base" />,
      title: "경험 공유 확인",
      description: "수혜자들의 합격 후기와 조언을 참고하세요.",
    },
    {
      icon: <FaClipboardList className="text-black text-base" />,
      title: "지원 및 관리",
      description: "지원서 작성 가이드를 참고하고 마감일을 관리하세요.",
    },
  ];

  return (
    <section id="how-to" className="py-10 sm:py-16 bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 제목 */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            이용 방법
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed whitespace-normal break-keep">
            ScholarMate를 통해 맞춤형 장학금을 찾고 지원하는 과정을 알아보세요.
          </p>
        </div>

        {/* 카드 영역 */}
        <div className="grid gap-x-4 gap-y-10 px-4 sm:gap-x-6 sm:px-6 md:grid-cols-4 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white p-4 sm:p-5 rounded-lg shadow-sm text-center"
            >
              {/* Step 라벨 */}
              <span className="block text-xs font-semibold text-gray-900 mb-1">
                Step {index + 1}
              </span>

              {/* 아이콘 (작게) */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                {step.icon}
              </div>

              {/* 제목 */}
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                {step.title}
              </h3>

              {/* 설명 */}
              <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                {step.description}
              </p>

              {/* 데스크탑: 오른쪽 화살표 */}
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 -right-8 hidden h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-400 md:flex">
                  <FaChevronRight className="text-sm" aria-hidden="true" />
                </div>
              )}

              {/* 모바일: 아래쪽 화살표 */}
              {index < steps.length - 1 && (
                <div className="absolute -bottom-8 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center text-gray-400 md:hidden">
                  <FaChevronDown className="text-gray-400 text-base" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

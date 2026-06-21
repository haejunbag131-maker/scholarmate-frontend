import 전체장학금 from "../../assets/img/home-card-all.webp";
import 맞춤형추천 from "../../assets/img/home-card-recommendation.webp";
import 장학캘린더 from "../../assets/img/home-card-calendar.webp";

export default function CardSection() {
  const cards = [
    {
      title: "전체 장학금",
      description: "다양한 기관의 장학금 정보를 한 곳에서 통합 관리",
      image: 전체장학금,
    },
    {
      title: "맞춤형 추천",
      description: "AI 기반 개인 맞춤형 장학금 추천 시스템",
      image: 맞춤형추천,
    },
    {
      title: "장학 캘린더",
      description: "장학금 신청 일정 및 마감일 관리 시스템",
      image: 장학캘린더,
    },
  ];

  return (
    <section id="functions" className="py-10 sm:py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 제목 */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            주요 기능
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            장학금 지원을 위한 핵심 기능을 제공합니다
          </p>
        </div>

        {/* 1024px 아래: 슬라이더 */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:hidden">
          {cards.map((card) => (
            <div key={card.title} className="min-w-[82%] snap-center sm:min-w-[46%] md:min-w-[38%]">
              <div className="min-w-0 bg-white p-4 rounded-lg shadow border border-gray-200 text-left">
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-32 object-cover rounded-lg mb-3 border border-gray-300 sm:h-36"
                />
                <h3 className="mb-1 truncate text-base font-semibold text-gray-900">
                  {card.title}
                </h3>
                <p className="truncate text-xs text-gray-600 leading-snug">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 1024px 이상: 그리드 */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="min-w-0 bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition text-left"
            >
              <img
                src={card.image}
                alt={card.title}
                loading="lazy"
                decoding="async"
                className="w-full h-40 object-cover rounded-lg mb-3 border border-gray-300"
              />
              <h3 className="mb-1 truncate text-base font-semibold text-gray-900">
                {card.title}
              </h3>
              <p className="truncate text-xs sm:text-sm text-gray-600 leading-snug">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

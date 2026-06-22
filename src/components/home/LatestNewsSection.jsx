import { FaArrowRight, FaGraduationCap, FaStar } from "react-icons/fa";
import koreaImg from "../../assets/img/home-news-kosaf.webp";
import dreamsponImg from "../../assets/img/home-news-dreamspon.webp";
import useHorizontalDragScroll from "../../shared/hooks/useHorizontalDragScroll";

export default function LatestNewsSection() {
  const newsSliderDrag = useHorizontalDragScroll();
  const news = [
    {
      Icon: FaGraduationCap,
      source: "한국장학재단 (KOSAF)",
      title: "국가에서 운영하는 공식 장학금 지원 기관",
      description:
        "국가장학금 1유형/2유형을 포함한 공공재정 기반 장학금 제공, 다양한 봉사장학금, 우수인재 국가장학금, 다자녀장학금 등 운영",
      image: koreaImg,
      link: "https://www.kosaf.go.kr",
      imgClass: "sm:max-h-40",
    },
    {
      Icon: FaStar,
      source: "드림스폰 (DreamSpon)",
      title: "민간이 운영하는 장학 후원 매칭 플랫폼",
      description:
        "저소득층, 다문화, 탈북, 보호종료청년 등 사회적 배려계층 중심 지원, 단순한 금전 지원뿐만 아니라 멘토링, 진로상담, 정서 지원 등 포함",
      image: dreamsponImg,
      link: "https://www.dreamspon.com",
      imgClass: "sm:max-h-28",
    },
  ];

  return (
    <section id="news" className="py-10 sm:py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 제목 */}
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            최신 소식
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            최신 장학금 소식을 확인하세요
          </p>
        </div>

        {/* 1280px 아래: 슬라이더, 1280px 이상: 2열 그리드 */}
        <div
          ref={newsSliderDrag.scrollRef}
          className={[
            "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:gap-6 sm:px-6 xl:mx-0 xl:grid xl:grid-cols-2 xl:overflow-visible xl:px-0 xl:pb-0",
            newsSliderDrag.isDragging ? "cursor-grabbing" : "cursor-grab xl:cursor-default",
          ].join(" ")}
          {...newsSliderDrag.dragScrollProps}
        >
          {news.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[82vw] min-w-[82vw] snap-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:w-[72vw] sm:min-w-[72vw] md:w-[58vw] md:min-w-[58vw] xl:w-full xl:min-w-0"
            >
              <div className="bg-white flex h-28 items-center justify-center border-b border-gray-200 px-3 py-2 sm:h-48 sm:px-0 sm:py-0">
                <img
                  src={item.image}
                  alt={`${item.title} 이미지`}
                  loading="lazy"
                  decoding="async"
                  className={`object-contain max-h-20 ${item.imgClass}`}
                />
              </div>
              <div className="p-4 sm:p-5 text-left">
                <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-gray-500 sm:text-xs">
                  <item.Icon className="h-3.5 w-3.5 text-gray-900" aria-hidden="true" />
                  {item.source}
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="line-clamp-3 text-[11px] sm:text-sm text-gray-600 mb-2 sm:mb-3 leading-snug">
                  {item.description}
                </p>
                <span className="text-xs sm:text-sm text-gray-900 font-medium transition-colors">
                  <span className="inline-flex items-center gap-1">
                    자세히 보기
                    <FaArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

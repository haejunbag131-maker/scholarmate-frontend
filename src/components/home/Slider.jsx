import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import sliderImage1 from "../../assets/img/home-hero-scholarships.webp";
import sliderImage2 from "../../assets/img/home-hero-recommendation.webp";

const AUTO_ROTATE_DELAY_MS = 18000;

export default function SliderSection() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSlideIndexes, setLoadedSlideIndexes] = useState(() => new Set([0]));
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(() =>
    typeof document === "undefined" ? false : document.hidden
  );
  const swipeRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    tracking: false,
  });

  const slides = [
    {
      img: sliderImage1,
      width: 1440,
      height: 427,
      title: "ScholarMate",
      desc: (
        <>
          ScholarMate는 장학금 지원 기회를 놓치는 문제를 해결하고, <br />더 많은
          학생들에게 교육의 평등성을 제공하는 것이 목표입니다.
        </>
      ),
      cta: { label: "자세히 알아보기", to: "/introduction" },
    },
    {
      img: sliderImage2,
      width: 1440,
      height: 427,
      title: "사용자 맞춤 추천",
      desc: (
        <>
          당신에게 맞는 장학금을 찾아보세요! <br />
          AI가 당신에게 가장 적합한 장학금을 추천해드립니다.
        </>
      ),
      cta: { label: "추천 받기", to: "/recommendation" },
    },
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    const syncVisibility = () => setIsDocumentHidden(document.hidden);

    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isDocumentHidden || isAutoPaused) return undefined;

    const timerId = window.setTimeout(() => {
      setActiveIndex((current) => {
        const nextIndex = (current + 1) % slides.length;
        setLoadedSlideIndexes((loaded) => new Set(loaded).add(nextIndex));
        return nextIndex;
      });
    }, AUTO_ROTATE_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [activeIndex, isAutoPaused, isDocumentHidden, prefersReducedMotion, slides.length]);

  const goToSlide = (nextIndex) => {
    const normalizedIndex = (nextIndex + slides.length) % slides.length;
    setLoadedSlideIndexes((loaded) => new Set(loaded).add(normalizedIndex));
    setActiveIndex(normalizedIndex);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse") return;
    swipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      tracking: true,
    };
  };

  const finishSwipe = (event) => {
    const swipe = swipeRef.current;
    if (!swipe.tracking || swipe.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;
    const isHorizontalSwipe =
      Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

    swipeRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      tracking: false,
    };

    if (!isHorizontalSwipe) return;
    goToSlide(activeIndex + (deltaX < 0 ? 1 : -1));
  };

  const cancelSwipe = () => {
    swipeRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      tracking: false,
    };
  };

  const handleBlurCapture = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsAutoPaused(false);
    }
  };

  return (
    <section className="mx-auto w-full" aria-roledescription="carousel">
      <div
        className="relative h-[400px] touch-pan-y select-none overflow-hidden max-xl:h-[320px] max-md:h-[260px] max-[480px]:h-[220px]"
        onMouseEnter={() => setIsAutoPaused(true)}
        onMouseLeave={() => setIsAutoPaused(false)}
        onFocusCapture={() => setIsAutoPaused(true)}
        onBlurCapture={handleBlurCapture}
        onPointerDown={handlePointerDown}
        onPointerUp={finishSwipe}
        onPointerCancel={cancelSwipe}
        onPointerLeave={cancelSwipe}
      >
        {slides.map((slide, index) => (
          <article
            key={slide.title}
            className={[
              "pointer-events-none absolute inset-0 flex h-[400px] w-full items-center justify-center opacity-0 transition-opacity duration-[450ms] ease-in-out max-xl:h-[320px] max-md:h-[260px] max-[480px]:h-[220px]",
              index === activeIndex ? "pointer-events-auto opacity-100" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={index !== activeIndex}
          >
            {loadedSlideIndexes.has(index) && (
              <img
                src={slide.img}
                alt=""
                width={slide.width}
                height={slide.height}
                className="absolute inset-0 h-full w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding={index === 0 ? "sync" : "async"}
              />
            )}
            <div className="absolute inset-0 z-[1] bg-black/35" />
            <div className="relative z-[2] w-[1160px] px-4 text-center text-white max-xl:w-[90%] max-md:w-full md:px-8">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl xl:text-6xl">
                {slide.title}
              </h2>
              <p className="mb-4 text-base leading-relaxed max-[480px]:mb-3 max-[480px]:text-[13px] md:text-lg xl:text-xl">
                {slide.desc}
              </p>
              <button
                onClick={() => navigate(slide.cta.to)}
                disabled={index !== activeIndex}
                tabIndex={index === activeIndex ? 0 : -1}
                className="cursor-pointer rounded-lg border-0 bg-black/80 px-6 py-3 text-base font-bold text-white shadow-md shadow-black/30 transition duration-300 hover:scale-105 hover:border-transparent hover:bg-black hover:text-white focus:border-transparent focus:outline-none active:scale-100 disabled:pointer-events-none max-xl:px-5 max-xl:py-2.5 max-xl:text-sm max-md:rounded-md max-md:px-4 max-md:py-2 max-md:text-[13px]"
              >
                {slide.cta.label}
              </button>
            </div>
          </article>
        ))}

        <button
          type="button"
          className="absolute left-5 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[32px] text-white transition hover:border-transparent hover:bg-white/90 hover:text-neutral-900 hover:shadow-[0_8px_22px_rgba(0,0,0,0.28)] focus:border-transparent focus:bg-transparent focus:text-white focus:shadow-none focus:outline-none max-md:hidden"
          onClick={() => goToSlide(activeIndex - 1)}
          aria-label="이전 슬라이드"
        >
          <FaChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className="absolute right-5 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[32px] text-white transition hover:border-transparent hover:bg-white/90 hover:text-neutral-900 hover:shadow-[0_8px_22px_rgba(0,0,0,0.28)] focus:border-transparent focus:bg-transparent focus:text-white focus:shadow-none focus:outline-none max-md:hidden"
          onClick={() => goToSlide(activeIndex + 1)}
          aria-label="다음 슬라이드"
        >
          <FaChevronRight aria-hidden="true" />
        </button>

        <div
          className="absolute bottom-4 left-1/2 z-[11] flex -translate-x-1/2 gap-1 max-md:bottom-2 max-[480px]:bottom-1.5"
          aria-label="슬라이드 선택"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className="relative h-6 w-6 border-0 bg-transparent p-0 hover:border-transparent hover:bg-transparent focus:border-transparent focus:bg-transparent focus:shadow-none focus:outline-none"
              onClick={() => goToSlide(index)}
              aria-label={`${index + 1}번 슬라이드 보기`}
              aria-current={index === activeIndex}
            >
              <span
                className={[
                  "absolute inset-[7px] rounded-full",
                  index === activeIndex ? "bg-white" : "bg-white/60",
                ].join(" ")}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

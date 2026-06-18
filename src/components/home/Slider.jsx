import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import sliderImage1 from "../../assets/img/home-hero-scholarships.webp";
import sliderImage2 from "../../assets/img/home-hero-recommendation.webp";
import "../../assets/css/slider.css";

export default function SliderSection() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSlideIndexes, setLoadedSlideIndexes] = useState(() => new Set([0]));
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
          학생들에게 교육의 평등성을 제공하는 것을 목표로 합니다.
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
    const timerId = window.setInterval(() => {
      setActiveIndex((current) => {
        const nextIndex = (current + 1) % slides.length;
        setLoadedSlideIndexes((loaded) => new Set(loaded).add(nextIndex));
        return nextIndex;
      });
    }, 10000);

    return () => window.clearInterval(timerId);
  }, [slides.length]);

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

  return (
    <section className="slider__wrap" aria-roledescription="carousel">
      <div
        className="slider"
        onPointerDown={handlePointerDown}
        onPointerUp={finishSwipe}
        onPointerCancel={cancelSwipe}
        onPointerLeave={cancelSwipe}
      >
        {slides.map((slide, index) => (
          <article
            key={slide.title}
            className={`slider__slide ${index === activeIndex ? "is-active" : ""}`}
            aria-hidden={index !== activeIndex}
          >
            {loadedSlideIndexes.has(index) && (
              <img
                src={slide.img}
                alt=""
                width={slide.width}
                height={slide.height}
                className="slider__image"
                loading={index === 0 ? "eager" : "lazy"}
                {...{ fetchpriority: index === 0 ? "high" : "auto" }}
                decoding={index === 0 ? "sync" : "async"}
              />
            )}
            <div className="slider__overlay" />
            <div className="desc text-white px-4 md:px-8">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                {slide.title}
              </h2>
              <p className="text-base md:text-lg lg:text-xl mb-6 leading-relaxed">
                {slide.desc}
              </p>
              <button
                onClick={() => navigate(slide.cta.to)}
                disabled={index !== activeIndex}
                tabIndex={index === activeIndex ? 0 : -1}
                className="slider-btn"
              >
                {slide.cta.label}
              </button>
            </div>
          </article>
        ))}

        <button
          type="button"
          className="arrow prev"
          onClick={() => goToSlide(activeIndex - 1)}
          aria-label="이전 슬라이드"
        >
          <FaChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className="arrow next"
          onClick={() => goToSlide(activeIndex + 1)}
          aria-label="다음 슬라이드"
        >
          <FaChevronRight aria-hidden="true" />
        </button>

        <div className="slider__dots" aria-label="슬라이드 선택">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => goToSlide(index)}
              aria-label={`${index + 1}번 슬라이드 보기`}
              aria-current={index === activeIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import Slider from "../components/home/Slider"; 
import CommunityNotice from "../components/home/CommunityNotice";

const FeatureSection = lazy(() => import("../components/home/FeatureSection"));
const CardSection = lazy(() => import("../components/home/CardSection"));
const WorkSection = lazy(() => import("../components/home/WorkSection"));
const LatestNewsSection = lazy(() => import("../components/home/LatestNewsSection"));
const ContactSection = lazy(() => import("../components/home/ContactSection"));
const Footer = lazy(() => import("../components/home/Footer"));

function DeferredHomeSections() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (shouldLoad) return;
    const sentinel = sentinelRef.current;
    if (!sentinel || !("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={sentinelRef} className="w-full">
      {shouldLoad ? (
        <Suspense fallback={<div className="min-h-48 w-full" aria-hidden="true" />}>
          <FeatureSection />
          <CardSection />
          <WorkSection />
          <LatestNewsSection />
          <ContactSection />
          <Footer />
        </Suspense>
      ) : (
        <div className="min-h-48 w-full" aria-hidden="true" />
      )}
    </div>
  );
}

function HomeTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frameId = 0;

    const updateVisibility = () => {
      frameId = 0;
      setVisible((current) => {
        const next = window.scrollY > 420;
        return current === next ? current : next;
      });
    };

    const handleScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="맨 위로 이동"
      className={`fixed bottom-5 right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition duration-200 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 sm:bottom-7 sm:right-7 sm:h-12 sm:w-12 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <FaArrowUp aria-hidden="true" />
    </button>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen w-full max-w-full flex-col items-center justify-start overflow-x-hidden pb-0 text-center">
      <h1 className="sr-only">ScholarMate</h1>
      <Slider />
      <CommunityNotice />
      <DeferredHomeSections />
      <HomeTopButton />
    </div>
  );
}

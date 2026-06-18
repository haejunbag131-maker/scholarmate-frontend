import "../assets/css/Home.css";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
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

export default function Home() {
  return (
    <div className="home-container pb-0">
      <h1 className="sr-only">ScholarMate</h1>
      <Slider />
      <CommunityNotice />
      <DeferredHomeSections />
    </div>
  );
}

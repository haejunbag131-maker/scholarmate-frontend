import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function scrollToSectionId(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  return true;
}

export default function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) return undefined;

    const animationFrameId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const hash = location.hash?.slice(1);
    if (!hash) return undefined;

    let tries = 0;
    let animationFrameId = 0;

    const tick = () => {
      tries += 1;
      const ok = scrollToSectionId(hash);
      if (!ok && tries < 40) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [location.key, location.hash]);

  return null;
}

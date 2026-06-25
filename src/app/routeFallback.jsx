import LoadingState from "../shared/components/LoadingState";
import ScholarshipRouteFallback from "./ScholarshipRouteFallback";

export function getRouteFallback(pathname) {
  if (pathname === "/scholarships") return <ScholarshipRouteFallback />;
  if (pathname === "/interest") return <ScholarshipRouteFallback wishlist />;
  return <LoadingState minHeight="calc(100vh - 72px)" />;
}

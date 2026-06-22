import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import isTokenExpired from "./api/auth";
import api from "./api/axios";
import {
  loginSucceeded,
  selectAuthChecked,
  selectIsLoggedIn,
  setAuthChecked,
  setLoggedIn,
} from "./features/auth/authSlice";

import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import LoadingState from "./shared/components/LoadingState";
import { SkeletonCardGrid, SkeletonTable } from "./shared/components/Skeleton";
import {
  scholarshipMobileListClassName,
  scholarshipTableClassName,
  scholarshipTableWrapperClassName,
  wishlistMobileListClassName,
  wishlistTableClassName,
  wishlistTableWrapperClassName,
} from "./features/scholarships/components/ScholarshipListViews";

const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const UserInfoPage = lazy(() => import("./pages/UserInfo"));
const Scholarships = lazy(() => import("./pages/Scholarships"));
const Recommendation = lazy(() => import("./pages/Recommendation"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const CommunityDetail = lazy(() => import("./pages/CommunityDetail"));
const NoticeList = lazy(() => import("./pages/NoticeList"));
const NoticeDetail = lazy(() => import("./pages/NoticeDetail"));
const MessagesList = lazy(() => import("./pages/MessagesList"));
const Messages = lazy(() => import("./pages/Messages"));
const Introduction = lazy(() => import("./pages/Introduction"));
const Wishlist = lazy(() => import("./pages/Wishlist"));

function ScholarshipRouteFallback({ wishlist = false }) {
  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-5 pb-10 pt-5">
      <div className="mb-6 border-b border-gray-300 pb-4">
        <div className="mx-auto h-9 w-44 animate-pulse rounded bg-slate-100" aria-hidden="true" />
      </div>
      <SkeletonTable
        rows={wishlist ? 5 : 10}
        columns={5}
        wrapperClassName={wishlist ? wishlistTableWrapperClassName : scholarshipTableWrapperClassName}
        tableClassName={wishlist ? wishlistTableClassName : scholarshipTableClassName}
        align={wishlist ? "center" : "left"}
      />
      <SkeletonCardGrid
        count={wishlist ? 3 : 4}
        className={wishlist ? wishlistMobileListClassName : scholarshipMobileListClassName}
        variant="scholarship"
        actionCount={wishlist ? 3 : 2}
      />
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const authChecked = useSelector(selectAuthChecked);
  const location = useLocation();

  // 로그인 상태 점검
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const autoLogin = localStorage.getItem("autoLogin") === "true";

      if (token && !isTokenExpired(token)) {
        if (!cancelled) {
          dispatch(setLoggedIn(true));
          dispatch(setAuthChecked(true));
        }
        return;
      }

      if (token && refreshToken && autoLogin) {
        try {
          const { data } = await api.post(
            "/auth/jwt/refresh/",
            { refresh: refreshToken },
            { skipAuthRedirect: true }
          );
          if (data?.access) {
            localStorage.setItem("token", data.access);
            if (!cancelled) dispatch(loginSucceeded());
            return;
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        } finally {
          if (!cancelled) dispatch(setAuthChecked(true));
        }
        return;
      }

      if (token && isTokenExpired(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
      if (!cancelled) {
        dispatch(setLoggedIn(false));
        dispatch(setAuthChecked(true));
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [dispatch, location.pathname]);

  // 중앙 정렬 스크롤 
  const scrollToSectionId = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  };

  // 페이지 이동 시 상단에서 시작
  useEffect(() => {
    if (location.hash) return;

    const animationFrameId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [location.pathname, location.hash]);

  // 해시 접근/변경 시 스크롤
  useEffect(() => {
    const hash = location.hash?.slice(1);
    if (!hash) return;

    let tries = 0;
    const tick = () => {
      tries++;
      const ok = scrollToSectionId(hash);
      if (!ok && tries < 40) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [location.key, location.hash]);

  const routeFallback =
    location.pathname === "/scholarships" ? (
      <ScholarshipRouteFallback />
    ) : location.pathname === "/interest" ? (
      <ScholarshipRouteFallback wishlist />
    ) : (
      <LoadingState minHeight="calc(100vh - 72px)" />
    );

  return (
    <>
      <Header />

      <main className="content">
        <Suspense fallback={routeFallback}>
          {!authChecked ? (
            routeFallback
          ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/scholarships"
              element={<PrivateRoute isLoggedIn={isLoggedIn}><Scholarships /></PrivateRoute>}
            />
            <Route
              path="/recommendation"
              element={<PrivateRoute isLoggedIn={isLoggedIn}><Recommendation /></PrivateRoute>}
            />
            <Route
              path="/interest"
              element={<PrivateRoute isLoggedIn={isLoggedIn}><Wishlist /></PrivateRoute>}
            />
            <Route
              path="/calendar"
              element={<PrivateRoute isLoggedIn={isLoggedIn}><CalendarPage /></PrivateRoute>}
            />
            <Route
              path="/userinfor"
              element={<PrivateRoute isLoggedIn={isLoggedIn}><UserInfoPage /></PrivateRoute>}
            />
            <Route path="/community" element={<CommunityPage />} />
            <Route
              path="/profile"
              element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={isLoggedIn ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/register"
              element={isLoggedIn ? <Navigate to="/" /> : <Register />}
            />
            <Route path="/introduction" element={<Introduction />} />
            <Route path="/notice" element={<NoticeList />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
            <Route
              path="/community/:id"
              element={<PrivateRoute isLoggedIn={isLoggedIn}><CommunityDetail /></PrivateRoute>}
            />
            <Route
              path="/messages"
              element={<PrivateRoute isLoggedIn={isLoggedIn}><MessagesList /></PrivateRoute>}
            />
            <Route
              path="/messages/:conversationId"
              element={<PrivateRoute isLoggedIn={isLoggedIn}><Messages /></PrivateRoute>}
            />
          </Routes>
          )}
        </Suspense>
      </main>
    </>
  );
}

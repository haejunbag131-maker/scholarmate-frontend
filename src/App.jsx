import { lazy, Suspense, useState, useEffect } from "react";
import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import isTokenExpired from "./api/auth";
import api from "./api/axios";

import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";

const Home = lazy(() => import("./pages/Home"));
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

import "antd/dist/reset.css";
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("token");
    return !!token && !isTokenExpired(token);
  });
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 상태 점검
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const autoLogin = localStorage.getItem("autoLogin") === "true";

      if (token && !isTokenExpired(token)) {
        if (!cancelled) setIsLoggedIn(true);
        if (!cancelled) setAuthChecked(true);
        return;
      }

      if (token && refreshToken && autoLogin) {
        try {
          const { data } = await api.post("/auth/jwt/refresh/", { refresh: refreshToken });
          if (data?.access) {
            localStorage.setItem("token", data.access);
            if (!cancelled) setIsLoggedIn(true);
            return;
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        } finally {
          if (!cancelled) setAuthChecked(true);
        }
        return;
      }

      if (token && isTokenExpired(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
      if (!cancelled) setIsLoggedIn(false);
      if (!cancelled) setAuthChecked(true);
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // 중앙 정렬 스크롤 
  const scrollToSectionId = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  };

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

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/", { replace: true });
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main className="content">
        <Suspense fallback={<div className="py-16 text-center text-sm text-gray-500">로딩 중...</div>}>
          {!authChecked ? (
            <div className="py-16 text-center text-sm text-gray-500">로딩 중...</div>
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
            <Route
              path="/community"
              element={<PrivateRoute isLoggedIn={isLoggedIn}><CommunityPage /></PrivateRoute>}
            />
            <Route
              path="/profile"
              element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={isLoggedIn ? <Navigate to="/" /> : <Register />}
            />
            <Route path="/introduction" element={<Introduction />} />
            <Route path="/notice" element={<NoticeList />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
            <Route path="/community/:id" element={<CommunityDetail />} />
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

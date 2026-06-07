import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import isTokenExpired from "./api/auth";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pendingHashRef = useRef(null);

  // 로그인 상태 점검
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(!!token);
    }
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
    const hash = location.hash?.slice(1) || pendingHashRef.current;
    if (!hash) return;

    let tries = 0;
    const tick = () => {
      tries++;
      const ok = scrollToSectionId(hash);
      if (!ok && tries < 40) requestAnimationFrame(tick);
      else pendingHashRef.current = null;
    };
    requestAnimationFrame(tick);
  }, [location.key, location.hash]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/", { replace: true });
  };

  // 홈 섹션으로 이동
  const goToSection = (sectionId) => {
    setSidebarOpen(false);

    if (location.pathname !== "/") {
      pendingHashRef.current = sectionId;
      navigate(`/#${sectionId}`);
      return;
    }

    if (location.hash !== `#${sectionId}`) {
      history.replaceState(null, "", `/#${sectionId}`);
    }

    setTimeout(() => {
      if (!scrollToSectionId(sectionId)) {
        let tries = 0;
        const id = setInterval(() => {
          tries++;
          const ok = scrollToSectionId(sectionId);
          if (ok || tries > 30) clearInterval(id);
        }, 50);
      }
    }, 0);
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        goToSection={goToSection}
      />

      <main className="content">
        <Suspense fallback={<div className="py-16 text-center text-sm text-gray-500">로딩 중...</div>}>
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
        </Suspense>
      </main>
    </>
  );
}

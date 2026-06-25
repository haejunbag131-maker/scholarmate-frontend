import { lazy } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import { selectAuthChecked, selectIsLoggedIn } from "../features/auth/authSlice";
import AppLayout from "../shared/layout/AppLayout";
import Home from "../pages/Home";
import { getRouteFallback } from "./routeFallback";

const Register = lazy(() => import("../pages/Register"));
const Login = lazy(() => import("../pages/Login"));
const Profile = lazy(() => import("../pages/Profile"));
const UserInfoPage = lazy(() => import("../pages/UserInfo"));
const Scholarships = lazy(() => import("../pages/Scholarships"));
const Recommendation = lazy(() => import("../pages/Recommendation"));
const CalendarPage = lazy(() => import("../pages/Calendar"));
const CommunityPage = lazy(() => import("../pages/CommunityPage"));
const CommunityDetail = lazy(() => import("../pages/CommunityDetail"));
const NoticeList = lazy(() => import("../pages/NoticeList"));
const NoticeDetail = lazy(() => import("../pages/NoticeDetail"));
const MessagesList = lazy(() => import("../pages/MessagesList"));
const Messages = lazy(() => import("../pages/Messages"));
const Introduction = lazy(() => import("../pages/Introduction"));
const Wishlist = lazy(() => import("../pages/Wishlist"));

export default function AppRoutes() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const authChecked = useSelector(selectAuthChecked);
  const location = useLocation();
  const routeFallback = getRouteFallback(location.pathname);

  return (
    <Routes>
      <Route element={<AppLayout fallback={routeFallback} />}>
        {!authChecked ? (
          <Route path="*" element={routeFallback} />
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route
              path="/scholarships"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Scholarships />
                </PrivateRoute>
              }
            />
            <Route
              path="/recommendation"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Recommendation />
                </PrivateRoute>
              }
            />
            <Route
              path="/interest"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Wishlist />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <CalendarPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/userinfor"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <UserInfoPage />
                </PrivateRoute>
              }
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
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <CommunityDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <MessagesList />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages/:conversationId"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Messages />
                </PrivateRoute>
              }
            />
          </>
        )}
      </Route>
    </Routes>
  );
}

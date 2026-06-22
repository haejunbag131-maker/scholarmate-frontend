// src/components/Header.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import { logoutSucceeded, selectIsLoggedIn } from "../features/auth/authSlice";
import HeaderMessagesIcon from "./HeaderMessagesIcon";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();

  const itemCls =
    "block w-full text-left px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition";

  const DrawerItem = ({ to, onClick, children }) =>
    to ? (
      <Link to={to} onClick={onClick} className={itemCls}>
        {children}
      </Link>
    ) : (
      <button type="button" onClick={onClick} className={itemCls}>
        {children}
      </button>
    );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    dispatch(logoutSucceeded());
    navigate("/");
  };

  const handleLoginClick = () => {
    setSidebarOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/*  헤더  */}
      <header className="header flex flex-wrap justify-between items-center px-4 py-3 bg-white shadow-md sticky top-0 z-50">
        {/* 왼쪽 */}
        <div className="flex min-w-0 flex-1 items-center xl:flex-none">
          <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="ScholarMate 홈">
            <img
              src="/logo.svg"
              alt="ScholarMate"
              width="168"
              height="112"
              className="logo h-9 w-auto sm:h-10"
            />
            <span className="hidden whitespace-nowrap text-xl font-black tracking-normal text-[#0078BF] sm:inline xl:text-2xl">
              ScholarMate
            </span>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="nav hidden flex-1 min-w-0 gap-2 text-base xl:flex xl:flex-wrap xl:justify-center">
          <Link to="/scholarships" className="nav-btn">전체 장학금</Link>
          <Link to="/recommendation" className="nav-btn">추천 장학금</Link>
          <Link to="/interest" className="nav-btn">관심 장학금</Link>
          <Link to="/calendar" className="nav-btn">나의 장학 캘린더</Link>
          <Link to="/userinfor" className="nav-btn">나의 장학 정보</Link>
        </nav>

        {/* 오른쪽 */}
        <div className="header-right flex flex-row gap-2 items-center whitespace-nowrap">
          <HeaderMessagesIcon />

          {isLoggedIn ? (
            <>
              <button className="header-action-btn header-action-btn--primary hidden text-xs sm:text-sm xl:inline-flex xl:text-base" onClick={() => navigate("/profile")}>
                마이페이지
              </button>
              <button className="header-action-btn hidden text-xs sm:text-sm xl:inline-flex xl:text-base" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button className="header-action-btn header-action-btn--primary hidden text-xs sm:text-sm xl:inline-flex xl:text-base" onClick={() => navigate("/login")}>
              로그인
            </button>
          )}

          {/* 햄버거 버튼 */}
          <button
            type="button"
            className="sidebar-toggle-btn text-xl sm:text-2xl"
            aria-label="메뉴 열기"
            aria-controls="left-drawer"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <FaBars aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Drawer */}
      <div id="left-drawer" className={`drawer ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)}>
        <nav className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-head flex justify-between items-center p-4 border-b">
            <strong>메뉴</strong>
            <button
              type="button"
              className="drawer-close text-2xl"
              onClick={() => setSidebarOpen(false)}
              aria-label="메뉴 닫기"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <div className="drawer-links p-2">
            <DrawerItem to="/scholarships" onClick={() => setSidebarOpen(false)}>전체 장학금</DrawerItem>
            <DrawerItem to="/recommendation" onClick={() => setSidebarOpen(false)}>추천 장학금</DrawerItem>
            <DrawerItem to="/interest" onClick={() => setSidebarOpen(false)}>관심 장학금</DrawerItem>
            <DrawerItem to="/calendar" onClick={() => setSidebarOpen(false)}>나의 장학 캘린더</DrawerItem>
            <DrawerItem to="/userinfor" onClick={() => setSidebarOpen(false)}>나의 장학 정보</DrawerItem>
            <hr className="drawer-sep my-2" />
            <DrawerItem to="/community" onClick={() => setSidebarOpen(false)}>커뮤니티</DrawerItem>
          </div>

          <div className="drawer-actions p-4 border-t">
            {isLoggedIn ? (
              <>
                <button className="drawer-btn primary header-action-btn--primary w-full mb-2" onClick={() => { setSidebarOpen(false); navigate("/profile"); }}>
                  마이페이지
                </button>
                <button className="drawer-btn header-action-btn--secondary w-full" onClick={() => { setSidebarOpen(false); handleLogout(); }}>
                  로그아웃
                </button>
              </>
            ) : (
              <button className="drawer-btn primary header-action-btn--primary w-full" onClick={handleLoginClick}>
                로그인
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

// src/components/Header.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from "../assets/img/로고.png";
import HeaderMessagesIcon from "./HeaderMessagesIcon";

export default function Header({ isLoggedIn, setIsLoggedIn }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    setIsLoggedIn(false);
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
        <div className="flex min-w-0 flex-1 items-center lg:flex-none">
          <Link to="/" className="flex min-w-0 items-center" aria-label="ScholarMate 홈">
            <img src={logo} alt="ScholarMate" className="logo h-12 w-auto sm:h-14" />
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="nav hidden flex-1 min-w-0 gap-2 text-base lg:flex lg:flex-wrap lg:justify-center">
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
              <button className="hidden px-3 py-1 bg-black text-white rounded text-xs sm:text-sm lg:inline-flex lg:text-base hover:bg-gray-800 transition" onClick={() => navigate("/profile")}>
                마이페이지
              </button>
              <button className="hidden px-3 py-1 bg-white border border-gray-400 rounded text-xs sm:text-sm lg:inline-flex lg:text-base hover:bg-gray-100 transition" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button className="hidden px-3 py-1 bg-black text-white rounded text-xs sm:text-sm lg:inline-flex lg:text-base hover:bg-gray-800 transition" onClick={() => navigate("/login")}>
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
            ☰
          </button>
        </div>
      </header>

      {/* Drawer */}
      <div id="left-drawer" className={`drawer ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)}>
        <nav className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-head flex justify-between items-center p-4 border-b">
            <strong>메뉴</strong>
            <button className="drawer-close text-2xl" onClick={() => setSidebarOpen(false)}>×</button>
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
                <button className="drawer-btn primary w-full mb-2" onClick={() => { setSidebarOpen(false); navigate("/profile"); }}>
                  마이페이지
                </button>
                <button className="drawer-btn w-full" onClick={() => { setSidebarOpen(false); handleLogout(); }}>
                  로그아웃
                </button>
              </>
            ) : (
              <button className="drawer-btn primary w-full" onClick={handleLoginClick}>
                로그인
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

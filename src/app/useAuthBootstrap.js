import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import isTokenExpired from "../api/auth";
import api from "../api/axios";
import {
  loginSucceeded,
  setAuthChecked,
  setLoggedIn,
} from "../features/auth/authSlice";

export default function useAuthBootstrap() {
  const dispatch = useDispatch();
  const location = useLocation();

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
}

import { createSlice } from "@reduxjs/toolkit";
import isTokenExpired from "../../api/auth";

const token = localStorage.getItem("token");
const hasValidToken = Boolean(token && !isTokenExpired(token));

const initialState = {
  isLoggedIn: hasValidToken,
  authChecked: !token || hasValidToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedIn(state, action) {
      state.isLoggedIn = action.payload;
    },
    setAuthChecked(state, action) {
      state.authChecked = action.payload;
    },
    loginSucceeded(state) {
      state.isLoggedIn = true;
      state.authChecked = true;
    },
    logoutSucceeded(state) {
      state.isLoggedIn = false;
      state.authChecked = true;
    },
  },
});

export const {
  setLoggedIn,
  setAuthChecked,
  loginSucceeded,
  logoutSucceeded,
} = authSlice.actions;

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectAuthChecked = (state) => state.auth.authChecked;

export default authSlice.reducer;

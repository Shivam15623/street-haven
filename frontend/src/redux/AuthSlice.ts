import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

import type {
  AuthState,
  ChangeUserDetailsPayLoad,
  SetLoggedInPayload,
} from "../interfaces/AuthInterfaces";

const initialState: AuthState = {
  isLoggedIn: false,
  accessToken: "",
  user: null,
  authStatus: "unknown",
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /**
     * User successfully authenticated.
     */
    setLoggedIn: (state, action: PayloadAction<SetLoggedInPayload>) => {
      state.isLoggedIn = true;
      state.authStatus = "authenticated";
      state.accessToken = action.payload.accessToken ?? "";
      state.user = action.payload.UserData;
    },

    /**
     * Account has been deactivated by admin.
     *
     * We intentionally keep this separate from setLoggedOut()
     * so RouteGuard knows WHY authentication failed.
     */
    setAccountInactive: (state) => {
      state.isLoggedIn = false;
      state.authStatus = "inactive";
      state.accessToken = "";
      state.user = null;
    },

    /**
     * User is not authenticated.
     */
    setLoggedOut: (state) => {
      state.isLoggedIn = false;
      state.authStatus = "unauthenticated";
      state.accessToken = "";
      state.user = null;
    },

    /**
     * Update current user's profile/details.
     */
    UpdateUserDetails: (
      state,
      action: PayloadAction<ChangeUserDetailsPayLoad>,
    ) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },

    /**
     * Useful when the application starts and
     * silent-auth is being checked.
     */
    setAuthChecking: (state) => {
      state.authStatus = "unknown";
    },
  },
});

export const {
  setLoggedIn,
  setLoggedOut,
  setAccountInactive,
  setAuthChecking,
  UpdateUserDetails,
} = authSlice.actions;

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;

export const selectUser = (state: RootState) => state.auth.user;

export const token = (state: RootState) => state.auth.accessToken;

export const selectAuthStatus = (state: RootState) => state.auth.authStatus;

export const selectAuth = (state: RootState) => state.auth;

export default authSlice;

import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  AuthState,
  ChangeUserDetailsPayLoad,
  SetLoggedInPayload,
} from "../interfaces/AuthInterfaces";

const initialState: AuthState = {
  isLoggedIn: false,
  accessToken: "",
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedIn: (state, action: PayloadAction<SetLoggedInPayload>) => {
      state.isLoggedIn = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.UserData;
    },
    UpdateUserDetails: (
      state,
      action: PayloadAction<ChangeUserDetailsPayLoad>
    ) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },

    setLoggedOut: () => initialState,
  },
});

export const { setLoggedIn, setLoggedOut,UpdateUserDetails } = authSlice.actions;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectUser = (state: RootState) => state.auth.user;
export const token = (state: RootState) => state.auth.accessToken;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice;

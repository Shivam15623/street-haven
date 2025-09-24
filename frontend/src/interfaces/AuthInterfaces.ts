import type { ApiResponse } from "./Response";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  role: "admin" | "employee";
  profilePic?: string;
  slug: string;
}
export interface ChangeUserDetailsPayLoad {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNo?: string;
  profilePic?: string;
  slug?: string;
}
export interface AuthState {
  isLoggedIn: boolean;
  accessToken: string;
  user?: User | null;
}
export interface SetLoggedInPayload {
  accessToken: string;
  UserData: User;
}

export interface LoginResponseData {
  user: User;
  refreshToken: string;
  accessToken: string;
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}
export interface ForgotPasswordcredential {
  token: string;
  newpassword: string;
}

export interface RequestResetPasswordcredential {
  email: string;
}
export type LoginResponse = ApiResponse<LoginResponseData>;

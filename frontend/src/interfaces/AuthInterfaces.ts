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
  createdAt: string;
}
export interface ChangeUserDetailsPayLoad {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNo?: string;
  profilePic?: string;
  slug?: string;
  createdAt?: string;
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
  status: "TOTP_SETUP_REQUIRED" | "TOTP_REQUIRED";
  tempToken: string;
}
export interface LoginVerifyTotpcredentials {
  tempToken: string;
  totpCode: number;
}
export interface LoginVerifyTotpResponseData {
  user: User;
  refreshToken: string;
  accessToken: string;
}
interface GenerateTotpResponseData {
  qrCode: string;
  setupToken: string;
}
export interface SetUpTotpResponseCredentials{
  tempToken:string;
  totpCode:number
}

export interface GenerateTotpCredentials {
  tempToken: string;
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
  newPassword: string;
  confirmPassword: string;
}

export interface RequestResetPasswordcredential {
  email: string;
}
export type LoginResponse = ApiResponse<LoginResponseData>;
export type LoginVerifyTotpResponse = ApiResponse<LoginVerifyTotpResponseData>;
export type GenerateTotpResponse = ApiResponse<GenerateTotpResponseData>;

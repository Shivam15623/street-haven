import type { AllPermissions } from "../utills/auth/permissions";
import type { ApiResponse } from "./Response";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  role: Role;
  profilePic?: string;
  slug: string;
  createdAt: string;
  title: string;
  hireDate: string;
  customPermissions: AllPermissions[];
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
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
  HR: "hr",
  DIRECTOR: "director",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface LoginResponseData {
  status: "TOTP_SETUP_REQUIRED" | "TOTP_REQUIRED";
  tempToken: string;
}
export interface LoginVerifyTotpcredentials {
  tempToken: string;
  totpCode: number;
}
interface UserVerify {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  role: Role;
  profilePic?: string;
  slug: string;
  createdAt: string;
  title: string;
  hireDate: Date;
  customPermissions: AllPermissions[];
}
export interface LoginVerifyTotpResponseData {
  user: UserVerify;
  refreshToken: string;
  accessToken: string;
}
interface GenerateTotpResponseData {
  qrCode: string;
  setupToken: string;
}
export interface SetUpTotpResponseCredentials {
  tempToken: string;
  totpCode: number;
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
  role: Role;
  customPermissions: string[];
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

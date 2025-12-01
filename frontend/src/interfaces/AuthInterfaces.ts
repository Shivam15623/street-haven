import type { ApiResponse } from "./Response";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  role: string;
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
export interface FeaturePermission {
  key: string;
  label: string;
  allowed: boolean;
  _id: string;
}

export interface RoleModulePermission {
  moduleName: string;
  moduleKey: string;
  access: boolean;

  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;

  features: FeaturePermission[];

  _id: string;
}

export interface RolePermission {
  permissions: RoleModulePermission[];
}
export interface AuthState {
  isLoggedIn: boolean;
  accessToken: string;
  user?: User | null;
  Permissions: RoleModulePermission[];
}
export interface SetLoggedInPayload {
  accessToken: string;
  UserData: User;
  Permissions: RoleModulePermission[];
}

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
  role: {
    _id: string;
    roleName: string;
    permissions: RoleModulePermission[];
  };
  profilePic?: string;
  slug: string;
  createdAt: string;
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

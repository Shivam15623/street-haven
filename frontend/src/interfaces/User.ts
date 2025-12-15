import type { ApiResponse } from "./Response";

interface EditUserData {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNo: string;
  role: "admin" | "employee";
  profilePic?: string;
  slug: string;
}
interface UserProfile {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNo: string;
  role: "admin" | "employee";
  profilePic?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  hireDate: Date;
  timePeriod: {
    value: number;
    unit: "days" | "weeks" | "months" | "years";
  };
}
export interface changePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export type EditUserProfileResponse = ApiResponse<EditUserData>;
export type UserProfileResponse = ApiResponse<UserProfile>;

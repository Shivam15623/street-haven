import type { Role } from "./AuthInterfaces";
import type { ApiResponse } from "./Response";

interface EditUserData {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNo: string;
  role: Role;
  profilePic?: string;
  slug: string;
}
interface UserProfile {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNo: string;
  role: Role;
  profilePic?: string;
  status: "inactive" | "active";
  slug: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  hireDate: Date;
  location:{
    name:string;
    _id:string;
    slug:string;
    isActive:boolean;
  }[]|null
}
export interface changePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export type EditUserProfileResponse = ApiResponse<EditUserData>;
export type UserProfileResponse = ApiResponse<UserProfile>;

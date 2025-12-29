import { useSelector } from "react-redux";
import { selectAuth } from "../redux/AuthSlice";
import type { AllPermissions } from "../utills/auth/permissions";
import { ROLE_PERMISSIONS } from "../utills/auth/rolePermissions";

interface PermissionCheck {
  action: AllPermissions;
}

export type HasPermissionFn = (args: PermissionCheck) => boolean;

const useHasPermission = () => {
  const { user } = useSelector(selectAuth);

  // ─────────────────────────────
  // Check if user has a specific permission
  // ─────────────────────────────

  const hasPermission = ({ action }: PermissionCheck) => {
    if (!user) return false;

    const rolePermissions = [...ROLE_PERMISSIONS[user.role]];
    const userPermissions = user.customPermissions;
    const effectivePermissions = new Set([
      ...rolePermissions,
      ...userPermissions,
    ]);

    if (!effectivePermissions) return false;

    return effectivePermissions.has(action);
  };

  // ─────────────────────────────
  // Check if user has a specific role
  // ─────────────────────────────
  const hasRole = (roles: string | string[]) => {
    if (!user) return false;

    if (typeof roles === "string") {
      return user.role === roles;
    }

    return roles.includes(user.role);
  };

  return { hasPermission, hasRole };
};

export default useHasPermission;

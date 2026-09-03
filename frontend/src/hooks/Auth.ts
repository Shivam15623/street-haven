import { useMemo } from "react";
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

  const effectivePermissions = useMemo(() => {
    if (!user) return new Set<AllPermissions>();
    return new Set([
      ...ROLE_PERMISSIONS[user.role],
      ...(user.customPermissions ?? []),
    ]);
  }, [user]);

  const hasPermission = ({ action }: PermissionCheck) => {
    if (!user) return false;
    return effectivePermissions.has(action);
  };

  const hasAnyPermission = (actions: AllPermissions[]) => {
    if (!user) return false;
    return actions.some((action) => effectivePermissions.has(action));
  };

  const hasAllPermissions = (actions: AllPermissions[]) => {
    if (!user) return false;
    return actions.every((action) => effectivePermissions.has(action));
  };

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    if (typeof roles === "string") return user.role === roles;
    return roles.includes(user.role);
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions, hasRole };
};

export default useHasPermission;

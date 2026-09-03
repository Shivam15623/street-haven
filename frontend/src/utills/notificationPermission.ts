import type { User } from "../interfaces/AuthInterfaces";
import { ROLE_PERMISSIONS } from "./auth/rolePermissions";
import { PERMISSIONS, type AllPermissions } from "./auth/permissions";

const NOTIFICATION_PERMISSIONS: AllPermissions[] = [
  PERMISSIONS.VIEW_ANNOUNCEMENTS,
  PERMISSIONS.VIEW_COLLECTIVE_AGREEMENTS,
  PERMISSIONS.VIEW_PROGRAM_MANUALS,
];

export const getUserNotificationPermission = (
  user: User,
): AllPermissions[] | null => {
  const userPermissions: AllPermissions[] = ROLE_PERMISSIONS[user.role];

  if (!userPermissions || userPermissions.length === 0) {
    return null;
  }

  const matched = NOTIFICATION_PERMISSIONS.filter((permission) =>
    userPermissions.includes(permission),
  );

  return matched.length > 0 ? matched : null;
};
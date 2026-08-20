import type { User } from "../interfaces/AuthInterfaces";
import { ROLE_PERMISSIONS } from "./auth/rolePermissions";
import { PERMISSIONS } from "./auth/permissions"; // adjust import path as needed

// Permissions relevant to notification gating
const NOTIFICATION_PERMISSIONS = [
  PERMISSIONS.VIEW_ANNOUNCEMENTS,
  PERMISSIONS.VIEW_COLLECTIVE_AGREEMENTS,
  PERMISSIONS.VIEW_PROGRAM_MANUALS,
];

export const getUserNotificationPermission = (user: User): string[] | null => {
  const userPermissions = ROLE_PERMISSIONS[user.role];

  if (!userPermissions || userPermissions.length === 0) return null;

  const matched = NOTIFICATION_PERMISSIONS.filter((permission) =>
    userPermissions.includes(permission),
  );

  return matched.length > 0 ? matched : null;
};
import { ROLE_PERMISSIONS } from "../auth/rolePermissions.js";

export const authorizePermissions =
  ({ action }) =>
  (req, res, next) => {
    try {
      const role = req.user?.role;

      if (!role) {
        console.warn("AUTH ERROR: User has no role");
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      const rolePermissions = ROLE_PERMISSIONS[role];

      if (!rolePermissions) {
        console.warn("AUTH ERROR: Invalid role");
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      // 🔥 Simple permission check
      const hasPermission = rolePermissions.includes(action);

      if (!hasPermission) {
        console.warn(
          `AUTH ERROR: Permission denied → role=${role}, action=${action}`
        );
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      next();
    } catch (err) {
      console.error("AUTH MIDDLEWARE ERROR:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
